import { map } from 'nanostores';
import { workbenchStore } from './workbench';
export const shortcutsStore = map({
    toggleTerminal: {
        key: 'j',
        ctrlOrMetaKey: true,
        action: () => workbenchStore.toggleTerminal(),
    },
});
export const settingsStore = map({
    shortcuts: shortcutsStore.get(),
});
shortcutsStore.subscribe((shortcuts) => {
    settingsStore.set({
        ...settingsStore.get(),
        shortcuts,
    });
});
