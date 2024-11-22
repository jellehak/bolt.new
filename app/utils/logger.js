let currentLevel = import.meta.env.VITE_LOG_LEVEL ?? import.meta.env.DEV ? 'debug' : 'info';
const isWorker = 'HTMLRewriter' in globalThis;
const supportsColor = !isWorker;
export const logger = {
    trace: (...messages) => log('trace', undefined, messages),
    debug: (...messages) => log('debug', undefined, messages),
    info: (...messages) => log('info', undefined, messages),
    warn: (...messages) => log('warn', undefined, messages),
    error: (...messages) => log('error', undefined, messages),
    setLevel,
};
export function createScopedLogger(scope) {
    return {
        trace: (...messages) => log('trace', scope, messages),
        debug: (...messages) => log('debug', scope, messages),
        info: (...messages) => log('info', scope, messages),
        warn: (...messages) => log('warn', scope, messages),
        error: (...messages) => log('error', scope, messages),
        setLevel,
    };
}
function setLevel(level) {
    if ((level === 'trace' || level === 'debug') && import.meta.env.PROD) {
        return;
    }
    currentLevel = level;
}
function log(level, scope, messages) {
    const levelOrder = ['trace', 'debug', 'info', 'warn', 'error'];
    if (levelOrder.indexOf(level) < levelOrder.indexOf(currentLevel)) {
        return;
    }
    const allMessages = messages.reduce((acc, current) => {
        if (acc.endsWith('\n')) {
            return acc + current;
        }
        if (!acc) {
            return current;
        }
        return `${acc} ${current}`;
    }, '');
    if (!supportsColor) {
        console.log(`[${level.toUpperCase()}]`, allMessages);
        return;
    }
    const labelBackgroundColor = getColorForLevel(level);
    const labelTextColor = level === 'warn' ? 'black' : 'white';
    const labelStyles = getLabelStyles(labelBackgroundColor, labelTextColor);
    const scopeStyles = getLabelStyles('#77828D', 'white');
    const styles = [labelStyles];
    if (typeof scope === 'string') {
        styles.push('', scopeStyles);
    }
    console.log(`%c${level.toUpperCase()}${scope ? `%c %c${scope}` : ''}`, ...styles, allMessages);
}
function getLabelStyles(color, textColor) {
    return `background-color: ${color}; color: white; border: 4px solid ${color}; color: ${textColor};`;
}
function getColorForLevel(level) {
    switch (level) {
        case 'trace':
        case 'debug': {
            return '#77828D';
        }
        case 'info': {
            return '#1389FD';
        }
        case 'warn': {
            return '#FFDB6C';
        }
        case 'error': {
            return '#EE4744';
        }
        default: {
            return 'black';
        }
    }
}
export const renderLogger = createScopedLogger('Render');
