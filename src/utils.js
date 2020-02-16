export const tick = requestAnimationFrame;
export const isString = (val) => typeof val === 'string';
export const noop = () => {};

export function once(fn) {
    let called = false;
    return (...args) => {
        if (!called) fn(...args);
        called = true;
    };
}

function forEachClass(el, classes, method) {
    if (classes.indexOf(' ') !== -1) {
        classes.trim().split(/\s+/).forEach((name) => el.classList[method](name));
    } else {
        el.classList[method](classes);
    }
}

export function addClass(el, name) {
    forEachClass(el, name, 'add');
}

export function removeClass(el, name) {
    forEachClass(el, name, 'remove');
}
