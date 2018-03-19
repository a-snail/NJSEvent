'use strict';

document.title = 'njs.Event v' + njs.Event.version + ' - ' + document.title;

QUnit.module('read', njs.Event);

QUnit.test('njs.Event.version', function(assert) {
    assert.ok(
        (/^(\d+\.)(\d+\.)(\d+)$/).test(njs.Event.version),
        'The version information format is correct.'
    );
});

QUnit.test('njs.Event.extends()', function(assert) {
    var foo = {name: 'SampleObject'};
    njs.Event.extends(foo);

    assert.ok(foo.on, 'The `on()` method was successfully inherited.');
    assert.ok(foo.fire, 'The `fire()` method was successfully inherited.');
    assert.ok(foo.off, 'The `off()` method was successfully inherited.');
});

QUnit.test('njs.Event.toString()', function(assert) {
    assert.ok(
        (/^\[class\snjs\.Event]\sv\d+\.\d+\.\d+$/).test(njs.Event.toString()),
        'The class information string format is correct.'
    );
});

QUnit.test('{njs.Event}.fire()', function(assert) {
    var foo = {name: 'SomeObject'},
        baz = {prop: 'SomeData'},
        str = 'SomeString';
    njs.Event.extends(foo);

    assert.ok(
        foo.fire('someEvent'),
        'Even if an event for which an event listener is not registered occurs, the error does not occur.'
    );

    foo.on('someEvent1', function() {
        assert.ok(true, 'The event listener registered as the event occurs was called successfully.');
    });
    foo.fire('someEvent1');

    foo.on('someEvent2', function(eve) {
        assert.equal(
            eve.info,
            str,
            'The string object passed when the event occurs is passed successfully.'
        );
    });
    foo.fire('someEvent2', str);

    foo.on('someEvent3', function(eve) {
        assert.equal(
            eve.info.prop,
            baz.prop,
            'The data object passed when the event occurs is passed successfully.'
        );
    });
    foo.fire('someEvent3', baz);
});

QUnit.test('{njs.Event}.fireOnce()', function(assert) {
    var foo = {},
        bar = function() {
            assert.step('bar event listener called.');
        };
    njs.Event.extends(foo);

    foo.on('someEvent', bar);
    foo.fireOnce('someEvent');

    foo.fire('someEvent');
    foo.fire('someEvent');
    assert.verifySteps(
        ['bar event listener called.'],
        'The registered event listener is executed and then removed.'
    );
});

QUnit.test('{njs.Event}.hasListener()', function(assert) {
    var foo = {},
        bar = function() {};
    njs.Event.extends(foo);

    assert.ok(
        !foo.hasListener('someEvent', bar),
        'If the specified event listener is not registered, it returns `false`.'
    );
    foo.on('someEvent', bar);
    assert.ok(
        foo.hasListener('someEvent', bar),
        'If the specified event listener is registered, it returns `true`.'
    );
});

QUnit.test('{njs.Event}.hasListeners()', function(assert) {
    var foo = {},
        lis = function() {};
    njs.Event.extends(foo);

    foo.on('someEvent', lis);
    assert.ok(
        foo.hasListeners('someEvent'),
        'If exists event listener registered with the specified event, it returns `true`.'
    );
    assert.ok(
        !foo.hasListeners('otherEvent'),
        'If not exists event listener registered with the specified event, it returns `false`.'
    );
});

QUnit.test('{njs.Event}.off()', function(assert) {
    var foo = {},
        bar = function() {
            assert.step('bar event listener called.');
        };
    njs.Event.extends(foo);

    foo.on('someEvent', bar);
    foo.fire('someEvent');

    foo.off('someEvent', bar);
    foo.fire('someEvent');
    assert.verifySteps(
        ['bar event listener called.'],
        'The event listener was successfully removed.'
    );
});

QUnit.test('{njs.Event}.offAll()', function(assert) {
    var foo = {},
        bar = function() {
            assert.step('bar event listener called.');
        },
        baz = function() {
            assert.step('baz event listener called.');
        };
    njs.Event.extends(foo);

    foo.on('someEvent', bar);
    foo.on('someEvent', function() {
        assert.step('An anonymous event listener called.');
    });
    foo.on('otherEvent', baz);
    foo.fire('someEvent');
    foo.fire('otherEvent');

    foo.offAll();
    foo.fire('someEvent');
    foo.fire('otherEvent');
    assert.verifySteps(
        [
            'bar event listener called.',
            'An anonymous event listener called.',
            'baz event listener called.'
        ],
        'All registered event listeners have been successfully removed.'
    );
});

QUnit.test('{njs.Event}.offs()', function(assert) {
    var foo = {},
        bar = function() {
            assert.step('bar event listener called.');
        };
    njs.Event.extends(foo);

    foo.on('someEvent', bar);
    foo.on('someEvent', function() {
        assert.step('An anonymous event listener called.');
    });
    foo.fire('someEvent');

    foo.offs('someEvent');
    foo.fire('someEvent');
    assert.verifySteps(
        [
            'bar event listener called.',
            'An anonymous event listener called.'
        ],
        'All event listeners registered with the specified event were successfully removed.'
    );
});

QUnit.test('{njs.Event}.on()', function(assert) {
    var foo = {name: 'SomeObject'},
        bar = {name: 'OtherObject'},
        baz = {prop: 'SomeData'},
        str = 'SomeString';
    njs.Event.extends(foo);

    foo.on('someEvent1', function() {
        assert.ok(
            true,
            'The event listener was successfully registered and executed normally when the event occurred.'
        );
        assert.equal(
            this,
            foo,
            'If no scope is specified, `this` in the event listener is the object to which the event listener is registered.'
        );
    });
    foo.fire('someEvent1');

    foo.on('someEvent2', function() {
        assert.equal(this, bar, 'If specify a scope, `this` in the event listener is the specified scope object.');
    }, bar);
    foo.fire('someEvent2');

    foo.on('someEvent3', function(eve) {
        assert.equal(
            eve.data,
            str,
            'The string object passed when registering the event listener is successfully registered.'
        );
    }, null, str);
    foo.fire('someEvent3');

    foo.on('someEvent4', function(eve) {
        assert.equal(
            eve.data.prop,
            baz.prop,
            'The data object passed when registering the event listener is successfully registered.'
        );
    }, null, baz);
    foo.fire('someEvent4');

    foo.on('someEvent5', function() {
        assert.step('listener 1');
    });
    foo.on('someEvent5', function() {
        assert.step('listener 2');
    }, null, null, 100);
    foo.on('someEvent5', function() {
        assert.step('listener 3');
    }, null, null, 1);
    foo.fire('someEvent5');
    assert.verifySteps(
        ['listener 3', 'listener 1', 'listener 2'],
        'If multiple event listeners are registered in the same event, they are executed in the order of priority specified.'
    );
});

QUnit.test('{njs.Event}.once()', function(assert) {
    var foo = {},
        bar = function() {
            assert.step('bar event listener called.');
        };
    njs.Event.extends(foo);

    foo.once('someEvent', bar);
    foo.fire('someEvent');
    assert.verifySteps(
        ['bar event listener called.'],
        'The event listener was execute once and then successfully removed.'
    );
});
