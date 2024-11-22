import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { shortcutsStore } from '~/lib/stores/settings';
class ShortcutEventEmitter {
    #emitter = new EventTarget();
    dispatch(type) {
        this.#emitter.dispatchEvent(new Event(type));
    }
    on(type, cb) {
        this.#emitter.addEventListener(type, cb);
        return () => {
            this.#emitter.removeEventListener(type, cb);
        };
    }
}
export const shortcutEventEmitter = new ShortcutEventEmitter();
export function useShortcuts() {
    const shortcuts = useStore(shortcutsStore);
    useEffect(() => {
        const handleKeyDown = (event) => {
            const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
            for (const name in shortcuts) {
                const shortcut = shortcuts[name];
                if (shortcut.key.toLowerCase() === key.toLowerCase() &&
                    (shortcut.ctrlOrMetaKey
                        ? ctrlKey || metaKey
                        : (shortcut.ctrlKey === undefined || shortcut.ctrlKey === ctrlKey) &&
                            (shortcut.metaKey === undefined || shortcut.metaKey === metaKey)) &&
                    (shortcut.shiftKey === undefined || shortcut.shiftKey === shiftKey) &&
                    (shortcut.altKey === undefined || shortcut.altKey === altKey)) {
                    shortcutEventEmitter.dispatch(name);
                    event.preventDefault();
                    event.stopPropagation();
                    shortcut.action();
                    break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts]);
}
