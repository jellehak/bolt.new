import { atom } from 'nanostores';
import { newShellProcess } from '~/utils/shell';
import { coloredText } from '~/utils/terminal';
export class TerminalStore {
    #webcontainer;
    #terminals = [];
    showTerminal = import.meta.hot?.data.showTerminal ?? atom(false);
    constructor(webcontainerPromise) {
        this.#webcontainer = webcontainerPromise;
        if (import.meta.hot) {
            import.meta.hot.data.showTerminal = this.showTerminal;
        }
    }
    toggleTerminal(value) {
        this.showTerminal.set(value !== undefined ? value : !this.showTerminal.get());
    }
    async attachTerminal(terminal) {
        try {
            const shellProcess = await newShellProcess(await this.#webcontainer, terminal);
            this.#terminals.push({ terminal, process: shellProcess });
        }
        catch (error) {
            terminal.write(coloredText.red('Failed to spawn shell\n\n') + error.message);
            return;
        }
    }
    onTerminalResize(cols, rows) {
        for (const { process } of this.#terminals) {
            process.resize({ cols, rows });
        }
    }
}
