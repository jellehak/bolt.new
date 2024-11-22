import { atom, map } from 'nanostores';
import { ActionRunner } from '~/lib/runtime/action-runner';
import { webcontainer } from '~/lib/webcontainer';
import { unreachable } from '~/utils/unreachable';
import { EditorStore } from './editor';
import { FilesStore } from './files';
import { PreviewsStore } from './previews';
import { TerminalStore } from './terminal';
export class WorkbenchStore {
    #previewsStore = new PreviewsStore(webcontainer);
    #filesStore = new FilesStore(webcontainer);
    #editorStore = new EditorStore(this.#filesStore);
    #terminalStore = new TerminalStore(webcontainer);
    artifacts = import.meta.hot?.data.artifacts ?? map({});
    showWorkbench = import.meta.hot?.data.showWorkbench ?? atom(false);
    currentView = import.meta.hot?.data.currentView ?? atom('code');
    unsavedFiles = import.meta.hot?.data.unsavedFiles ?? atom(new Set());
    modifiedFiles = new Set();
    artifactIdList = [];
    constructor() {
        if (import.meta.hot) {
            import.meta.hot.data.artifacts = this.artifacts;
            import.meta.hot.data.unsavedFiles = this.unsavedFiles;
            import.meta.hot.data.showWorkbench = this.showWorkbench;
            import.meta.hot.data.currentView = this.currentView;
        }
    }
    get previews() {
        return this.#previewsStore.previews;
    }
    get files() {
        return this.#filesStore.files;
    }
    get currentDocument() {
        return this.#editorStore.currentDocument;
    }
    get selectedFile() {
        return this.#editorStore.selectedFile;
    }
    get firstArtifact() {
        return this.#getArtifact(this.artifactIdList[0]);
    }
    get filesCount() {
        return this.#filesStore.filesCount;
    }
    get showTerminal() {
        return this.#terminalStore.showTerminal;
    }
    toggleTerminal(value) {
        this.#terminalStore.toggleTerminal(value);
    }
    attachTerminal(terminal) {
        this.#terminalStore.attachTerminal(terminal);
    }
    onTerminalResize(cols, rows) {
        this.#terminalStore.onTerminalResize(cols, rows);
    }
    setDocuments(files) {
        this.#editorStore.setDocuments(files);
        if (this.#filesStore.filesCount > 0 && this.currentDocument.get() === undefined) {
            // we find the first file and select it
            for (const [filePath, dirent] of Object.entries(files)) {
                if (dirent?.type === 'file') {
                    this.setSelectedFile(filePath);
                    break;
                }
            }
        }
    }
    setShowWorkbench(show) {
        this.showWorkbench.set(show);
    }
    setCurrentDocumentContent(newContent) {
        const filePath = this.currentDocument.get()?.filePath;
        if (!filePath) {
            return;
        }
        const originalContent = this.#filesStore.getFile(filePath)?.content;
        const unsavedChanges = originalContent !== undefined && originalContent !== newContent;
        this.#editorStore.updateFile(filePath, newContent);
        const currentDocument = this.currentDocument.get();
        if (currentDocument) {
            const previousUnsavedFiles = this.unsavedFiles.get();
            if (unsavedChanges && previousUnsavedFiles.has(currentDocument.filePath)) {
                return;
            }
            const newUnsavedFiles = new Set(previousUnsavedFiles);
            if (unsavedChanges) {
                newUnsavedFiles.add(currentDocument.filePath);
            }
            else {
                newUnsavedFiles.delete(currentDocument.filePath);
            }
            this.unsavedFiles.set(newUnsavedFiles);
        }
    }
    setCurrentDocumentScrollPosition(position) {
        const editorDocument = this.currentDocument.get();
        if (!editorDocument) {
            return;
        }
        const { filePath } = editorDocument;
        this.#editorStore.updateScrollPosition(filePath, position);
    }
    setSelectedFile(filePath) {
        this.#editorStore.setSelectedFile(filePath);
    }
    async saveFile(filePath) {
        const documents = this.#editorStore.documents.get();
        const document = documents[filePath];
        if (document === undefined) {
            return;
        }
        await this.#filesStore.saveFile(filePath, document.value);
        const newUnsavedFiles = new Set(this.unsavedFiles.get());
        newUnsavedFiles.delete(filePath);
        this.unsavedFiles.set(newUnsavedFiles);
    }
    async saveCurrentDocument() {
        const currentDocument = this.currentDocument.get();
        if (currentDocument === undefined) {
            return;
        }
        await this.saveFile(currentDocument.filePath);
    }
    resetCurrentDocument() {
        const currentDocument = this.currentDocument.get();
        if (currentDocument === undefined) {
            return;
        }
        const { filePath } = currentDocument;
        const file = this.#filesStore.getFile(filePath);
        if (!file) {
            return;
        }
        this.setCurrentDocumentContent(file.content);
    }
    async saveAllFiles() {
        for (const filePath of this.unsavedFiles.get()) {
            await this.saveFile(filePath);
        }
    }
    getFileModifcations() {
        return this.#filesStore.getFileModifications();
    }
    resetAllFileModifications() {
        this.#filesStore.resetFileModifications();
    }
    abortAllActions() {
        // TODO: what do we wanna do and how do we wanna recover from this?
    }
    addArtifact({ messageId, title, id }) {
        const artifact = this.#getArtifact(messageId);
        if (artifact) {
            return;
        }
        if (!this.artifactIdList.includes(messageId)) {
            this.artifactIdList.push(messageId);
        }
        this.artifacts.setKey(messageId, {
            id,
            title,
            closed: false,
            runner: new ActionRunner(webcontainer),
        });
    }
    updateArtifact({ messageId }, state) {
        const artifact = this.#getArtifact(messageId);
        if (!artifact) {
            return;
        }
        this.artifacts.setKey(messageId, { ...artifact, ...state });
    }
    async addAction(data) {
        const { messageId } = data;
        const artifact = this.#getArtifact(messageId);
        if (!artifact) {
            unreachable('Artifact not found');
        }
        artifact.runner.addAction(data);
    }
    async runAction(data) {
        const { messageId } = data;
        const artifact = this.#getArtifact(messageId);
        if (!artifact) {
            unreachable('Artifact not found');
        }
        artifact.runner.runAction(data);
    }
    #getArtifact(id) {
        const artifacts = this.artifacts.get();
        return artifacts[id];
    }
}
export const workbenchStore = new WorkbenchStore();
