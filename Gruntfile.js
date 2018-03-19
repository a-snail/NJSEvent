module.exports = function(grunt) {
    var packageName  = '<%= package.name.replace(".eve", ".Eve") %>',
        packageVer   = '<%= package.version %>',
        today        = '<%= grunt.template.today("yyyy-mm-dd") %>',
        bannerConcat = '/*! ' + packageName + '.concat.v' + packageVer + '.js - ' + today + ' */\n',
        bannerUglify = '/*! ' + packageName + '.min.v' + packageVer + '.js - ' + today + ' */';

    grunt.initConfig({
        package: grunt.file.readJSON('package.json'),
        concat : {
            dist: {
                dest   : 'dist/' + packageName + '.concat.v' + packageVer + '.js',
                options: {
                    banner      : bannerConcat,
                    process     : function(source, filepath) {
                        return '// Source: ' + filepath + '\n' +
                               source.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    },
                    separator   : '\n\n',
                    stripBanners: true
                },
                src    : ['src/**/*.js']
            }
        },
        jshint : {
            test: {
                options: {
                    browser     : true,
                    eqeqeq      : true,
                    eqnull      : true,
                    globalstrict: true,
                    globals     : {njs: true},
                    force       : true
                },
                src    : ['<%= concat.dist.src %>']
            }
        },
        open   : {
            test: {
                app : 'Google Chrome',
                path: 'test/' + packageName + '.html'
            }
        },
        qunit  : {
            test: {
                options: {force: true},
                src    : ['test/**/*.html']
            }
        },
        uglify : {
            dist: {
                files  : [
                    {
                        dest: 'dist/' + packageName + '.min.v' + packageVer + '.js',
                        src : '<%= concat.dist.dest %>'
                    }
                ],
                options: {
                    banner: bannerUglify,
                    footer: '\n',
                    ie8   : true,
                    mangle: {toplevel: true},
                    output: {
                        ascii_only: true,
                        comments  : false,
                        ie8       : true
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-open');

    grunt.registerTask('default', [
        'concat:dist',
        'uglify:dist',
        'jshint:test',
        'qunit:test',
        'open:test'
    ]);
    grunt.registerTask('dist', [
        'concat:dist',
        'uglify:dist'
    ]);
    grunt.registerTask('test', [
        'jshint:test',
        'qunit:test',
        'open:test'
    ]);
};
