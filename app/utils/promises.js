export function withResolvers() {
    if (typeof Promise.withResolvers === 'function') {
        return Promise.withResolvers();
    }
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return {
        resolve,
        reject,
        promise,
    };
}
