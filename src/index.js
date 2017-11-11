import {
    noop,
    tick,
    once,
    addClass,
    removeClass,
    isString
} from './utils';

const toMs = s => Number(s.slice(0, -1)) * 1000;
const toMsArray = val => val.split(', ').map(toMs);
const defaultTransitionClasses = (name = 't') => ({
    active: `${name}-active`,
    from: `${name}-from`,
    to: `${name}-to`
});

function createTransitionClasses(opts) {
    const name = isString(opts) ? opts : opts.name;
    const defaultClasses = defaultTransitionClasses(name);

    if (isString(opts)) {
        return defaultClasses;
    }

    return {
        active: opts.activeClass || defaultClasses.active,
        from: opts.fromClass || defaultClasses.from,
        to: opts.toClass || defaultClasses.to
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
    const durations = toMsArray(style[`${type}Duration`]);
    const delays = toMsArray(style[`${type}Delay`]);
    const total = Math.max(...durations.map((d, i) => (d + delays[i])));

    return { durations, total, type };
}

function getTransitionInfo(el) {
    const style = window.getComputedStyle(el);
    const transitionTime = getDurationInfo(style, 'transition');
    const animationTime = getDurationInfo(style, 'animation');
    const getProp = prop => (
        (transitionTime.total >= animationTime.total)
            ? transitionTime[prop]
            : animationTime[prop]
    );

    return {
        count: getProp('durations').length,
        duration: getProp('total'),
        type: getProp('type')
    };
}

function onceTrantionEnd(el, fn) {
    const { type, duration, count } = getTransitionInfo(el);
    const eventType = type === 'transition' ? 'transitionend' : 'animationend';
    let ended = 0;

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

    setTimeout(() => {
        if (ended < count) callback();
    }, duration);

    el.addEventListener(eventType, onEnd);
}

function runTransition(el, classes, hooks) {
    hooks.before(el);
    addClass(el, classes.active);
    addClass(el, classes.from);

    onceTrantionEnd(el, once(() => {
        removeClass(el, classes.to);
        removeClass(el, classes.active);
        hooks.after(el);
    }));

    tick(() => {
        removeClass(el, classes.from);
        addClass(el, classes.to);
        hooks.start(el);
    });
}

export function createTransition(config) {
    const classes = createTransitionClasses(config);

    return (el, opts) => {
        const hooks = getTransitionHooks(opts || config);
        runTransition(el, classes, hooks);
    };
}

export default function transition(el, config) {
    createTransition(config)(el);
}
