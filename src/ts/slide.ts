class State {
    static states = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

    static register(target: HTMLElement) {
        if (this.states.has(target)) {
            clearTimeout(this.states.get(target));
        }
    }

    static set(target: HTMLElement, timeout: ReturnType<typeof setTimeout>) {
        this.states.set(target, timeout);
    }

    static delete(target: HTMLElement) {
        this.states.delete(target);
    }
}

function styleElement(target: HTMLElement, properties: Partial<CSSStyleDeclaration>) {
    for (const property in properties) {
        const value = properties[property];

        target.style[property] = value;
    }
}

function wrapElement(element: HTMLElement) {
    const wrapper = document.createElement('div');
    element.parentElement.insertBefore(wrapper, element);
    wrapper.append(element);

    return wrapper;
}

function unwrapElement(element: HTMLElement, wrapper: HTMLElement) {
    wrapper.parentElement.insertBefore(element, wrapper);
    wrapper.remove();
}

// bug if timeout is not called
export function hide(target: HTMLElement, duration = 500) {
    State.register(target);

    const wrapper = wrapElement(target);

    styleElement(wrapper, {
        transitionProperty: 'height, margin, padding',
        transitionDuration: duration + 'ms',
        boxSizing: 'border-box',
        height: wrapper.offsetHeight + 'px',
    });

    wrapper.offsetHeight;

    styleElement(wrapper, {
        overflow: 'hidden',
        height: '0',
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '0',
        marginBottom: '0',
    });

    const timeout = setTimeout(() => {
        styleElement(wrapper, {
            transitionProperty: null,
            transitionDuration: null,

            display: 'none',
            overflow: null,
            height: null,
            paddingTop: null,
            paddingBottom: null,
            marginTop: null,
            marginBottom: null,
        });

        styleElement(target, {
            display: 'none',
        });

        unwrapElement(target, wrapper);

        State.delete(target);
    }, duration);

    State.set(target, timeout);
    return timeout;
}

// bug if timeout is not called
export function show(target: HTMLElement, duration = 500) {
    State.register(target);

    const wrapper = wrapElement(target);

    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;
    if (display === 'none') display = 'block';

    styleElement(target, {
        display,
    });

    const height = wrapper.offsetHeight;

    styleElement(wrapper, {
        overflow: 'hidden',
        height: '0',
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '0',
        marginBottom: '0',
    });

    wrapper.offsetHeight;

    styleElement(wrapper, {
        boxSizing: 'border-box',
        transitionProperty: 'height, margin, padding',
        transitionDuration: duration + 'ms',
        height: height + 'px',
        paddingTop: null,
        paddingBottom: null,
        marginTop: null,
        marginBottom: null,
    });

    const timeout = setTimeout(() => {
        styleElement(wrapper, {
            transitionProperty: null,
            transitionDuration: null,
            height: null,
            overflow: null,
        });

        unwrapElement(target, wrapper);

        State.delete(target);
    }, duration);

    State.set(target, timeout);
    return timeout;
}

export function slideUp(target: HTMLElement, duration = 500) {
    State.register(target);

    styleElement(target, {
        transitionProperty: 'height, margin, padding',
        transitionDuration: duration + 'ms',
        boxSizing: 'border-box',
        height: target.offsetHeight + 'px',
    });

    target.offsetHeight;

    styleElement(target, {
        overflow: 'hidden',
        height: '0',
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '0',
        marginBottom: '0',
    });

    return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
            styleElement(target, {
                transitionProperty: null,
                transitionDuration: null,

                display: 'none',
                overflow: null,
                height: null,
                paddingTop: null,
                paddingBottom: null,
                marginTop: null,
                marginBottom: null,
            });

            State.delete(target);

            resolve();
        }, duration);

        State.set(target, timeout);
    });
}

export function slideDown(target: HTMLElement, duration = 500) {
    State.register(target);

    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;
    if (display === 'none') display = 'block';

    styleElement(target, {
        display,
    });

    const height = target.offsetHeight;

    styleElement(target, {
        overflow: 'hidden',
        height: '0',
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '0',
        marginBottom: '0',
    });

    target.offsetHeight;

    styleElement(target, {
        boxSizing: 'border-box',
        transitionProperty: 'height, margin, padding',
        transitionDuration: duration + 'ms',
        height: height + 'px',
        paddingTop: null,
        paddingBottom: null,
        marginTop: null,
        marginBottom: null,
    });

    return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
            styleElement(target, {
                transitionProperty: null,
                transitionDuration: null,
                height: null,
                overflow: null,
            });

            State.delete(target);
            resolve();
        }, duration);

        State.set(target, timeout);
    });
}

export function slideToggle(target: HTMLElement, duration = 500) {
    if (window.getComputedStyle(target).display === 'none') {
        return slideDown(target, duration);
    } else {
        return slideUp(target, duration);
    }
}
