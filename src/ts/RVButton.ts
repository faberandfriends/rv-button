import EventEmitter from './EventEmitter';
import { slideUp, slideDown } from './slide';

interface Events {
    open: () => void;
    close: () => void;
    beforeOpen: () => Promise<void>;
    beforeClose: () => Promise<void>;
    afterOpen: () => void;
    afterClose: () => void;
}

export type RVButtonOptions = {
    once?: boolean;
    // scrollOnOpen?: boolean; //| HTMLElement;
    // scrollOnClose?: boolean; //| HTMLElement;
    icon?: {
        position: 'before' | 'after';
        open: string;
        close: string;
    };
    // onOpen?: () => void;
    // onClose?: () => void;
    // onAfterOpen?: () => void;
    // onAfterClose?: () => void;
    isOpen?: boolean;
    isActive?: boolean;
    // slide?: boolean;
    // text?: {
    //     open: string;
    //     close: string;
    // };
    responsive?: {
        [key: number]: RVButtonOptions;
    };

    // not working responsive
    eventListeners?: Partial<Events>;
};

const defaultOptions: RVButtonOptions = {
    once: false,
    isOpen: false,
    isActive: true,
};

export default class RVButton {
    private triggers: HTMLElement[];
    private objects: HTMLElement[];
    private originalOptions: RVButtonOptions;
    private currentOptions: RVButtonOptions;
    private _isOpen: boolean;
    private _isActive: boolean;
    private emitter: EventEmitter<Events>;
    private currentScreenSize: number;

    constructor(
        triggers: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
        objects: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
        options: RVButtonOptions = {}
    ) {
        this.triggers = RVButton.toElementArray(triggers);
        this.objects = RVButton.toElementArray(objects);
        this.originalOptions = { ...defaultOptions, ...options };
        this.currentOptions = options;
        this.emitter = new EventEmitter<Events>();

        this.init();
        this.registerDOMEvents();
        this.registerEventListeners();
    }

    async toggle() {
        this._isOpen ? await this.close() : await this.open();
    }

    async open() {
        if (!this._isActive) return;
        await Promise.all(this.emitter.emit('beforeOpen'));
        this.emitter.emit('open');

        this._isOpen = true;

        await Promise.all(this.objects.map((object) => slideDown(object)));

        for (const trigger of this.triggers) {
            trigger.classList.remove('closed');
            trigger.classList.add('opened');
        }

        if (this.currentOptions.once) this.removeTriggers();
        this.changeIcon();
        this.emitter.emit('afterOpen');
    }

    async close() {
        if (!this._isActive) return;
        await Promise.all(this.emitter.emit('beforeClose'));
        this.emitter.emit('close');

        this._isOpen = false;

        await Promise.all(this.objects.map((object) => slideUp(object)));

        for (const trigger of this.triggers) {
            trigger.classList.remove('opened');
            trigger.classList.add('closed');
        }

        this.changeIcon();
        this.emitter.emit('afterClose');
    }

    private removeTriggers() {
        for (const trigger of this.triggers) {
            slideUp(trigger);
        }
    }

    private changeIcon() {
        if (!this.currentOptions.icon) return;

        for (const trigger of this.triggers) {
            const state = this._isOpen ? 'open' : 'close';

            if (!trigger.classList.contains('custom-icon')) trigger.classList.add('custom-icon');
            trigger.setAttribute(`data-${this.currentOptions.icon.position}`, this.currentOptions.icon[state]);
        }
    }

    addEventListener<E extends keyof Events>(event: E, callback: Events[E]) {
        this.emitter.on(event, callback);
    }

    private init() {
        this.screenSizeChange(false);

        this._isOpen = this.currentOptions.isOpen;
        this._isActive = this.currentOptions.isActive;

        for (const object of this.objects) {
            if (!this._isOpen) object.style.display = 'none';
            else object.style.display = null;
        }

        for (const trigger of this.triggers) {
            !trigger.classList.contains('rv-button') ? trigger.classList.add('rv-button') : null;
            this.changeIcon();

            if (this._isOpen) {
                trigger.classList.add('opened');
                trigger.classList.remove('closed');
            } else {
                trigger.classList.add('closed');
                trigger.classList.remove('opened');
            }

            if (this._isActive) trigger.style.display = null;
            else trigger.style.display = 'none';
        }
    }

    private screenSizeChange(init: boolean = true) {
        const prevWidth = this.currentScreenSize;
        const newWidth = window.innerWidth;

        if (prevWidth === undefined || this.getNearestDisplaySize(prevWidth) != this.getNearestDisplaySize(newWidth)) {
            const nearestSize = this.getNearestDisplaySize(newWidth);

            if (nearestSize === -1) {
                this.currentOptions = this.originalOptions;
            } else {
                this.currentOptions = { ...this.originalOptions, ...this.originalOptions.responsive[nearestSize] };
            }

            init ? this.init() : null;
        }

        this.currentScreenSize = newWidth;
    }

    private getNearestDisplaySize(currentSize: number) {
        if (!('responsive' in this.originalOptions)) return -1;
        let nearestSize = -1;

        for (const key in this.originalOptions.responsive) {
            const size = parseInt(key);

            if ((nearestSize === -1 || nearestSize > size) && size >= currentSize) {
                nearestSize = size;
            }
        }

        return nearestSize;
    }

    private registerDOMEvents() {
        for (const trigger of this.triggers) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();

                this.toggle();
            });
        }

        window.addEventListener('resize', () => {
            this.screenSizeChange();
        });
    }

    private registerEventListeners() {
        if (!('eventListeners' in this.originalOptions)) return;

        type Listener = keyof Events;

        Object.keys(this.originalOptions.eventListeners).forEach((eventListener: Listener) => {
            const callback = this.originalOptions.eventListeners[eventListener];

            this.emitter.on(eventListener, callback);
        });
    }

    get isOpen() {
        return this._isOpen;
    }

    static create(buttonSelectors: { [key: string]: string }, options: RVButtonOptions = {}): RVButton[] {
        const buttons = [];

        for (const triggerSelector in buttonSelectors) {
            const objectSelector = buttonSelectors[triggerSelector];
            const trigger = document.querySelectorAll<HTMLElement>(triggerSelector);
            const object = document.querySelectorAll<HTMLElement>(objectSelector);

            if (trigger && object) buttons.push(new RVButton(trigger, object, options));
        }

        return buttons;
    }

    private static toElementArray(input: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>) {
        if (input instanceof Array) {
            return input;
        } else if (input instanceof NodeList) {
            return Array.from(input);
        } else if (input instanceof HTMLElement) {
            return [input];
        } else {
            console.error('No element found');
            return [];
        }
    }
}
