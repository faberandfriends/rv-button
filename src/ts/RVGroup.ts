import RVButton from './RVButton';

type options = {};

export default class RVGroup {
    private buttons: RVButton[];
    private options: options;

    constructor(buttons: RVButton[], options: options = {}) {
        this.buttons = buttons;
        this.options = options;

        this.registerListeners();
    }

    private closeAll(exceptions?: RVButton[]) {
        exceptions = exceptions ? exceptions : [];

        for (const button of this.buttons) {
            if (!exceptions.includes(button)) button.close();
        }
    }

    private openAll() {
        for (const button of this.buttons) {
            button.open();
        }
    }

    private registerListeners() {
        for (const button of this.buttons) {
            button.addEventListener('open', () => {
                this.closeAll([button]);
            });
        }
    }

    private get isOpen(): boolean {
        return this.buttons.some((button) => button.isOpen);
    }
}
