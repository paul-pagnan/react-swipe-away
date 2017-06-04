// t = current Time
// b = start value
// c = end value
// d = duration

export function easeInCubic(t, b, c, d) {
    return c * (t /= d) * t * t + b;
};

export function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
};

export function normaliseVelocity(velocity, min, max) {
    if (Math.abs(velocity) < min) {
        return velocity + (0.1 * Math.sign(velocity));
    } else if (velocity > max) {
        return max;
    }
    return velocity;
};

export function translateEvent(e) {
    return {
        direction: Math.sign(e.velocityX),
        delta: e.deltaX,
        velocity: e.velocityX
    };
};

export function runAnimationFrame(func) {
    if (window.requestAnimationFrame) {
        window.requestAnimationFrame(func);
    } else {
        setTimeout(func, 0);
    }
};

export function safeCall(func, attrs) {
    const mergedAttrs = Object.assign({}, attrs || {});

    if (func) {
        func(...mergedAttrs);
    }
};

export function timeSince(time) {
    return new Date().getTime() - time;
};

