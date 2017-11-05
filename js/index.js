const tick = requestAnimationFrame;
const toMs = s => Number(s.slice(0, -1)) * 1000;
const toMsArray = val => val.split(', ').map(toMs);
const defaultTransitionClasses = (name = 't') => ({
    active: `${name}-active`,
    from: `${name}-from`,
    to: `${name}-to`
});

function toggleClass(el, name, add) {
    if (name.indexOf(' ') !== -1) {
        name.trim().split(/\s+/).forEach(n => el.classList.toggle(n, add));
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

function once(fn) {
    let called = false;
    return () => {
        if (!called) fn.apply(this, arguments);
        called = true;
    }
}

function createTransitionClasses(opts) {
    const classes = defaultTransitionClasses(opts && opts.name || opts);

    return (typeof opts === 'object')
        ? Object.assign(classes, opts)
        : classes;
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
    const getProp = prop => (transitionTime.total >= animationTime.total ? transitionTime[prop] : animationTime[prop]);

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
        el.removeEventListener(eventType, onEnd);
        fn();
    }
    function onEnd(e) {
        if (e.target !== el) return;
        ended += 1;
        if(ended >= count) callback();
    }

    setTimeout(() => {
        if (ended < count) callback();
    }, duration);

    el.addEventListener(eventType, onEnd);
}

function runTransition(el, classes) {
    addClass(el, classes.active);
    addClass(el, classes.from);

    onceTrantionEnd(el, once(() => {
        removeClass(el, classes.to);
        removeClass(el, classes.active);
    }));

    tick(() => {
        removeClass(el, classes.from);
        addClass(el, classes.to);
    });
}

function createTranstion(name) {
    const classes = createTransitionClasses(name);
    return el => runTransition(el, classes);
}

function transition(el, name) {
    createTranstion(name)(el);
}