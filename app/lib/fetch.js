export async function request(url, init) {
    if (import.meta.env.DEV) {
        const nodeFetch = await import('node-fetch');
        const https = await import('node:https');
        const agent = url.startsWith('https') ? new https.Agent({ rejectUnauthorized: false }) : undefined;
        return nodeFetch.default(url, { ...init, agent });
    }
    return fetch(url, init);
}