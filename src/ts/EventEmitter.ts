interface EventsMap {
    [event: string]: any;
}

interface DefaultEvents extends EventsMap {
    [event: string]: (...args: any) => void;
}

export interface Unsubscribe {
    (): void;
}

export default class EventEmitter<Events extends EventsMap = DefaultEvents> {
    private events: Partial<{ [E in keyof Events]: Events[E][] }>;

    constructor() {
        this.events = {};
    }

    on<EventName extends keyof Events>(event: EventName, cb: Events[EventName]): Unsubscribe {
        (this.events[event] = this.events[event] || []).push(cb);
        return () => (this.events[event] = this.events[event].filter((i) => i !== cb));
    }

    emit<EventName extends keyof Events>(
        event: EventName,
        ...args: Parameters<Events[EventName]>
    ): ReturnType<Events[EventName]>[] {
        const out: ReturnType<Events[EventName]>[] = [];

        for (const callback of this.events[event] || []) {
            out.push(callback(...args));
        }

        return out;
    }
}
