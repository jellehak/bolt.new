import { WebContainer } from '@webcontainer/api';
import { map } from 'nanostores';
import * as nodePath from 'node:path';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';
const logger = createScopedLogger('ActionRunner');
export class ActionRunner {
    #webcontainer;
    #currentExecutionPromise = Promise.resolve();
    actions = map({});
    constructor(webcontainerPromise) {
        this.#webcontainer = webcontainerPromise;
    }
    addAction(data) {
        const { actionId } = data;
        const actions = this.actions.get();
        const action = actions[actionId];
        if (action) {
            // action already added
            return;
        }
        const abortController = new AbortController();
        this.actions.setKey(actionId, {
            ...data.action,
            status: 'pending',
            executed: false,
            abort: () => {
                abortController.abort();
                this.#updateAction(actionId, { status: 'aborted' });
            },
            abortSignal: abortController.signal,
        });
        this.#currentExecutionPromise.then(() => {
            this.#updateAction(actionId, { status: 'running' });
        });
    }
    async runAction(data) {
        const { actionId } = data;
        const action = this.actions.get()[actionId];
        if (!action) {
            unreachable(`Action ${actionId} not found`);
        }
        if (action.executed) {
            return;
        }
        this.#updateAction(actionId, { ...action, ...data.action, executed: true });
        this.#currentExecutionPromise = this.#currentExecutionPromise
            .then(() => {
            return this.#executeAction(actionId);
        })
            .catch((error) => {
            console.error('Action failed:', error);
        });
    }
    async #executeAction(actionId) {
        const action = this.actions.get()[actionId];
        this.#updateAction(actionId, { status: 'running' });
        try {
            switch (action.type) {
                case 'shell': {
                    await this.#runShellAction(action);
                    break;
                }
                case 'file': {
                    await this.#runFileAction(action);
                    break;
                }
            }
            this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
        }
        catch (error) {
            this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });
            // re-throw the error to be caught in the promise chain
            throw error;
        }
    }
    async #runShellAction(action) {
        if (action.type !== 'shell') {
            unreachable('Expected shell action');
        }
        const webcontainer = await this.#webcontainer;
        const process = await webcontainer.spawn('jsh', ['-c', action.content], {
            env: { npm_config_yes: true },
        });
        action.abortSignal.addEventListener('abort', () => {
            process.kill();
        });
        process.output.pipeTo(new WritableStream({
            write(data) {
                console.log(data);
            },
        }));
        const exitCode = await process.exit;
        logger.debug(`Process terminated with code ${exitCode}`);
    }
    async #runFileAction(action) {
        if (action.type !== 'file') {
            unreachable('Expected file action');
        }
        const webcontainer = await this.#webcontainer;
        let folder = nodePath.dirname(action.filePath);
        // remove trailing slashes
        folder = folder.replace(/\/+$/g, '');
        if (folder !== '.') {
            try {
                await webcontainer.fs.mkdir(folder, { recursive: true });
                logger.debug('Created folder', folder);
            }
            catch (error) {
                logger.error('Failed to create folder\n\n', error);
            }
        }
        try {
            await webcontainer.fs.writeFile(action.filePath, action.content);
            logger.debug(`File written ${action.filePath}`);
        }
        catch (error) {
            logger.error('Failed to write file\n\n', error);
        }
    }
    #updateAction(id, newState) {
        const actions = this.actions.get();
        this.actions.setKey(id, { ...actions[id], ...newState });
    }
}