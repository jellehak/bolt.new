import { atom, computed, map } from 'nanostores';
export class EditorStore {
    #filesStore;
    selectedFile = import.meta.hot?.data.selectedFile ?? atom();
    documents = import.meta.hot?.data.documents ?? map({});
    currentDocument = computed([this.documents, this.selectedFile], (documents, selectedFile) => {
        if (!selectedFile) {
            return undefined;
        }
        return documents[selectedFile];
    });
    constructor(filesStore) {
        this.#filesStore = filesStore;
        if (import.meta.hot) {
            import.meta.hot.data.documents = this.documents;
            import.meta.hot.data.selectedFile = this.selectedFile;
        }
    }
    setDocuments(files) {
        const previousDocuments = this.documents.value;
        this.documents.set(Object.fromEntries(Object.entries(files)
            .map(([filePath, dirent]) => {
            if (dirent === undefined || dirent.type === 'folder') {
                return undefined;
            }
            const previousDocument = previousDocuments?.[filePath];
            return [
                filePath,
                {
                    value: dirent.content,
                    filePath,
                    scroll: previousDocument?.scroll,
                },
            ];
        })
            .filter(Boolean)));
    }
    setSelectedFile(filePath) {
        this.selectedFile.set(filePath);
    }
    updateScrollPosition(filePath, position) {
        const documents = this.documents.get();
        const documentState = documents[filePath];
        if (!documentState) {
            return;
        }
        this.documents.setKey(filePath, {
            ...documentState,
            scroll: position,
        });
    }
    updateFile(filePath, newContent) {
        const documents = this.documents.get();
        const documentState = documents[filePath];
        if (!documentState) {
            return;
        }
        const currentContent = documentState.value;
        const contentChanged = currentContent !== newContent;
        if (contentChanged) {
            this.documents.setKey(filePath, {
                ...documentState,
                value: newContent,
            });
        }
    }
}
