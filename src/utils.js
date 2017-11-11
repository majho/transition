export const tick = requestAnimationFrame;
export const isString = val => typeof val === 'string';
export const noop = () => {};

export function once(fn) {
    let called = false;
    return (...args) => {
        if (!called) fn(...args);
        called = true;
    };
}

export function toggleClass(el, name, add) {
    if (name.indexOf(' ') !== -1) {
        name.trim().split(/\s+/).forEach(n => el.classList.toggle(n, add));
    } else {
        el.classList.toggle(name, add);
    }
}

export function addClass(el, name) {
    toggleClass(el, name, true);
}

export function removeClass(el, name) {
    toggleClass(el, name, false);
}
