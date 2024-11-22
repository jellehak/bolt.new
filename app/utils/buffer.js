export function bufferWatchEvents(timeInMs, cb) {
    let timeoutId;
    let events = [];
    // keep track of the processing of the previous batch so we can wait for it
    let processing = Promise.resolve();
    const scheduleBufferTick = () => {
        timeoutId = self.setTimeout(async () => {
            // we wait until the previous batch is entirely processed so events are processed in order
            await processing;
            if (events.length > 0) {
                processing = Promise.resolve(cb(events));
            }
            timeoutId = undefined;
            events = [];
        }, timeInMs);
    };
    return (...args) => {
        events.push(args);
        if (!timeoutId) {
            scheduleBufferTick();
        }
    };
}
