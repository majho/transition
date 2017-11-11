(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.transition = {})));
}(this, (function (exports) { 'use strict';

var tick = requestAnimationFrame;
var isString = function isString(val) {
    return typeof val === 'string';
};
var noop = function noop() {};

function once(fn) {
    var called = false;
    return function () {
        if (!called) fn.apply(undefined, arguments);
        called = true;
    };
}

function toggleClass(el, name, add) {
    if (name.indexOf(' ') !== -1) {
        name.trim().split(/\s+/).forEach(function (n) {
            return el.classList.toggle(n, add);
        });
    } else {
        el.classList.toggle(name, add);
    }
}

function addClass(el, name) {
    toggleClass(el, name, true);
}

function removeClass(el, name) {
    toggleClass(el, name, false);
}

var toMs = function toMs(s) {
    return Number(s.slice(0, -1)) * 1000;
};
var toMsArray = function toMsArray(val) {
    return val.split(', ').map(toMs);
};
var runTransitionClasses = function runTransitionClasses() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 't';
    return {
        active: name + '-active',
        from: name + '-from',
        to: name + '-to'
    };
};

function createClasses(opts) {
    var name = isString(opts) ? opts : opts.name;
    var runClasses = runTransitionClasses(name);

    if (isString(opts)) {
        return runClasses;
    }

    return {
        active: opts.activeClass || runClasses.active,
        from: opts.fromClass || runClasses.from,
        to: opts.toClass || runClasses.to
    };
}

function getTransitionHooks(opts) {
    if (isString(opts)) {
        return { before: noop, start: noop, after: noop };
    }

    return {
        before: opts.before || noop,
        start: opts.start || noop,
        after: opts.after || noop
    };
}

function getDurationInfo(style, type) {
    var durations = toMsArray(style[type + 'Duration']);
    var delays = toMsArray(style[type + 'Delay']);
    var total = Math.max.apply(Math, durations.map(function (d, i) {
        return d + delays[i];
    }));

    return { durations: durations, total: total, type: type };
}

function getTransitionInfo(el) {
    var style = window.getComputedStyle(el);
    var transitionTime = getDurationInfo(style, 'transition');
    var animationTime = getDurationInfo(style, 'animation');
    var getProp = function getProp(prop) {
        return transitionTime.total >= animationTime.total ? transitionTime[prop] : animationTime[prop];
    };

    return {
        count: getProp('durations').length,
        duration: getProp('total'),
        type: getProp('type')
    };
}

function onceTrantionEnd(el, fn) {
    var _getTransitionInfo = getTransitionInfo(el),
        type = _getTransitionInfo.type,
        duration = _getTransitionInfo.duration,
        count = _getTransitionInfo.count;

    var eventType = type === 'transition' ? 'transitionend' : 'animationend';
    var ended = 0;

    function callback() {
        // eslint-disable-next-line no-use-before-define
        el.removeEventListener(eventType, onEnd);
        fn();
    }
    function onEnd(e) {
        if (e.target !== el) return;
        ended += 1;
        if (ended >= count) callback();
    }

    setTimeout(function () {
        if (ended < count) callback();
    }, duration);

    el.addEventListener(eventType, onEnd);
}

function runTransition(el, classes, hooks) {
    hooks.before(el);
    addClass(el, classes.active);
    addClass(el, classes.from);

    onceTrantionEnd(el, once(function () {
        removeClass(el, classes.to);
        removeClass(el, classes.active);
        hooks.after(el);
    }));

    tick(function () {
        removeClass(el, classes.from);
        addClass(el, classes.to);
        hooks.start(el);
    });
}

function create(config) {
    var classes = createClasses(config);

    return function (el, opts) {
        var hooks = getTransitionHooks(opts || config);
        runTransition(el, classes, hooks);
    };
}

function transition(el, config) {
    create(config)(el);
}

exports.create = create;
exports['run'] = transition;

Object.defineProperty(exports, '__esModule', { value: true });

})));
