import { createScopedLogger } from '~/utils/logger';
const logger = createScopedLogger('ChatHistory');
// this is used at the top level and never rejects
export async function openDatabase() {
    return new Promise((resolve) => {
        const request = indexedDB.open('boltHistory', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('chats')) {
                const store = db.createObjectStore('chats', { keyPath: 'id' });
                store.createIndex('id', 'id', { unique: true });
                store.createIndex('urlId', 'urlId', { unique: true });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            resolve(undefined);
            logger.error(event.target.error);
        };
    });
}
export async function getAll(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readonly');
        const store = transaction.objectStore('chats');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
export async function setMessages(db, id, messages, urlId, description) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readwrite');
        const store = transaction.objectStore('chats');
        const request = store.put({
            id,
            messages,
            urlId,
            description,
            timestamp: new Date().toISOString(),
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
export async function getMessages(db, id) {
    return (await getMessagesById(db, id)) || (await getMessagesByUrlId(db, id));
}
export async function getMessagesByUrlId(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readonly');
        const store = transaction.objectStore('chats');
        const index = store.index('urlId');
        const request = index.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
export async function getMessagesById(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readonly');
        const store = transaction.objectStore('chats');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
export async function deleteById(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readwrite');
        const store = transaction.objectStore('chats');
        const request = store.delete(id);
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
    });
}
export async function getNextId(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readonly');
        const store = transaction.objectStore('chats');
        const request = store.getAllKeys();
        request.onsuccess = () => {
            const highestId = request.result.reduce((cur, acc) => Math.max(+cur, +acc), 0);
            resolve(String(+highestId + 1));
        };
        request.onerror = () => reject(request.error);
    });
}
export async function getUrlId(db, id) {
    const idList = await getUrlIds(db);
    if (!idList.includes(id)) {
        return id;
    }
    else {
        let i = 2;
        while (idList.includes(`${id}-${i}`)) {
            i++;
        }
        return `${id}-${i}`;
    }
}
async function getUrlIds(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('chats', 'readonly');
        const store = transaction.objectStore('chats');
        const idList = [];
        const request = store.openCursor();
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                idList.push(cursor.value.urlId);
                cursor.continue();
            }
            else {
                resolve(idList);
            }
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}
