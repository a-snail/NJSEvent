/*!
 * NJSEvent v1.0.1
 * https://github.com/a-snail/NJSEvent
 *
 * Jaeo Bok <snail.bok@gmail.com>
 * Released under the MIT license
 */

'use strict';

if (!window.njs) window.njs = {};

if (window.njs && !njs.Event) {

    njs.Event = (function() {

        var EventListeners = function(name) {

            this.name      = name;
            this.listeners = [];

            this.indexOf = function(listener) {
                var list = this.listeners,
                    len  = list.length;
                for (var i = 0; i < len; i++) {
                    if (list[i].listener === listener) {
                        return i;
                    }
                }
                return -1;
            };

        };

        var _name     = 'njs.Event',
            _verBuild = 1,
            _verMajor = 1,
            _verMinor = 0,
            _version  = _verMajor + '.' + _verMinor + '.' + _verBuild;

        var _getListOfEventListeners = function(target) {
                var lists = (target._getListOfEventListeners && target._getListOfEventListeners());
                lists     = lists || target.eventListeners || (target.eventListeners = {});
                return (lists.list || (lists.list = {}));
            },
            _getEventListeners       = function(name) {
                var list = _getListOfEventListeners(this);
                return (list[name] || (list[name] = new EventListeners(name)));
            };

        var _extends      = function(target) {
                if (!target) return;

                var prototype = njs.Event.prototype;
                for (var prop in prototype) {
                    if (prototype.hasOwnProperty(prop)) {
                        if (!target[prop] && !target.hasOwnProperty(prop)) {
                            target[prop] = prototype[prop];
                        }
                    }
                }
            },
            _fire         = (function() {
                var canceled = false,
                    cancel   = function() {canceled = true;},
                    stopped  = false,
                    stop     = function() {stopped = true;};

                return (function(name, info) {
                    var prevCanceled = canceled,
                        prevStopped  = stopped;

                    canceled = stopped = false;

                    var list = _getListOfEventListeners(this)[name];
                    if (list) {
                        var listeners = list.listeners;
                        if (listeners && listeners.length > 0) {
                            listeners = listeners.slice(0);

                            var result;
                            for (var i = 0; i < listeners.length; i++) {
                                result = listeners[i].call(this, info, stop, cancel);

                                if (result === false) {
                                    canceled = true;
                                }
                                else if (typeof result !== 'undefined') {
                                    info = result;
                                }

                                if (canceled || stopped) break;
                            }
                        }
                    }

                    var ret = (canceled ? false : (typeof info === 'undefined' ? true : info));

                    canceled = prevCanceled;
                    stopped  = prevStopped;

                    return ret;
                });
            })(),
            _fireOnce     = function(name, info) {
                var result = this.fire(name, info);
                delete _getListOfEventListeners(this)[name];
                return result;
            },
            _hasListener  = function(name, listener) {
                var list = _getListOfEventListeners(this)[name];
                return (list && list.indexOf(listener) >= 0);
            },
            _hasListeners = function(name) {
                var list = _getListOfEventListeners(this)[name];
                return (!!(list && list.listeners && list.listeners.length > 0));
            },
            _off          = function(name, listener) {
                if (!name || !listener) return;
                if (typeof name !== 'string' || typeof listener !== 'function') return;

                var names = name.split(' '),
                    len   = names.length;
                if (len > 1) {
                    for (var i = 0; i < len; i++) {
                        this.off(names[i], listener);
                    }
                    return;
                }

                var list = _getListOfEventListeners(this)[name];
                if (list) {
                    var idx = list.indexOf(listener);
                    if (idx >= 0) {
                        list.listeners.splice(idx, 1);
                    }
                }
            },
            _offAll       = function() {
                var list = _getListOfEventListeners(this);
                for (var name in list) {
                    if (list.hasOwnProperty(name)) {
                        list[name] = null;
                        delete list[name];
                    }
                }
            },
            _offs         = function(name) {
                if (!name) return;

                var names = name.split(' '),
                    len   = names.length;
                if (len > 1) {
                    for (var i = 0; i < len; i++) {
                        this.offs(names[i]);
                    }
                    return;
                }

                var list = _getListOfEventListeners(this);
                for (var type in list) {
                    if (name === type) {
                        list[name] = null;
                        delete list[name];
                        break;
                    }
                }
            },
            _on           = function(name, listener, scope, data, priority) {
                if (!name || !listener) return null;
                if (typeof name !== 'string' || typeof listener !== 'function') return null;

                var names = name.split(' '),
                    len   = names.length;
                if (len > 1) {
                    for (var i = 0; i < len; i++) {
                        this.on(names[i], listener, scope, data, priority);
                    }
                    return;
                }

                var self = this;
                if (!scope) scope = this;
                if (isNaN(priority)) priority = 10;

                var off = function() {
                    self.off(name, listener);
                };

                var fire = function(info, stop, cancel) {
                    var event = {
                        cancel: cancel,
                        data  : data,
                        info  : info,
                        off   : off,
                        sender: this,
                        stop  : stop,
                        name  : name
                    };

                    var result = listener.call(scope, event);
                    return (result === false ? false : event.info);
                };

                var eventListeners = _getEventListeners.call(this, name);
                if (eventListeners.indexOf(listener) < 0) {
                    var listeners = eventListeners.listeners;
                    fire.listener = listener;
                    fire.priority = priority;

                    for (var j = listeners.length - 1; j >= 0; j--) {
                        if (listeners[j].priority <= priority) {
                            listeners.splice(j + 1, 0, fire);
                            return {off: off};
                        }
                    }

                    listeners.unshift(fire);
                }

                return {off: off};
            },
            _once         = function() {
                var args     = Array.prototype.slice.call(arguments);
                var listener = args[1];
                args[1]      = function(eve) {
                    eve.off();
                    return listener.apply(this, arguments);
                };
                return this.on.apply(this, args);
            },
            _toString     = function() {
                return '[class ' + _name + '] v' + _version;
            };

        var Event = function() {};

        Event.version = _version;

        Event.extends  = _extends;
        Event.toString = _toString;

        Event.prototype = {
            fire        : _fire,
            fireOnce    : _fireOnce,
            hasListener : _hasListener,
            hasListeners: _hasListeners,
            off         : _off,
            offAll      : _offAll,
            offs        : _offs,
            on          : _on,
            once        : _once
        };

        return Event;

    })();

}
