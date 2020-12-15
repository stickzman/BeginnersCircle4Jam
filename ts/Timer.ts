class Timer {
    static timers = new Map()

    static check(id: string, duration: number, currTime = performance.now()) {
        if (!Timer.timers.has(id)) Timer.timers.set(id, currTime)

        const startTime = Timer.timers.get(id)
        if (currTime - startTime >= duration) {
            return true
        } else {
            return false
        }
    }

    // Optional manual start time.
    // Calling 'check' the first time would do this automatically.
    static start(id: string, currTime = performance.now()) {
        Timer.timers.set(id, currTime)
    }

    // Removes timer start time.
    // Next time 'check' is called for this id, it starts again
    static remove(id: string) {
        Timer.timers.delete(id)
    }
}
