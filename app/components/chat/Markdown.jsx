import { memo, useMemo } from 'react';
import ReactMarkdown, {} from 'react-markdown';
import { createScopedLogger } from '~/utils/logger';
import { rehypePlugins, remarkPlugins, allowedHTMLElements } from '~/utils/markdown';
import { Artifact } from './Artifact';
import { CodeBlock } from './CodeBlock';
import styles from './Markdown.module.scss';
const logger = createScopedLogger('MarkdownComponent');
export const Markdown = memo(({ children, html = false, limitedMarkdown = false }) => {
    logger.trace('Render');
    const components = useMemo(() => {
        return {
            div: ({ className, children, node, ...props }) => {
                if (className?.includes('__boltArtifact__')) {
                    const messageId = node?.properties.dataMessageId;
                    if (!messageId) {
                        logger.error(`Invalid message id ${messageId}`);
                    }
                    return <Artifact messageId={messageId}/>;
                }
                return (<div className={className} {...props}>
            {children}
          </div>);
            },
            pre: (props) => {
                const { children, node, ...rest } = props;
                const [firstChild] = node?.children ?? [];
                if (firstChild &&
                    firstChild.type === 'element' &&
                    firstChild.tagName === 'code' &&
                    firstChild.children[0].type === 'text') {
                    const { className, ...rest } = firstChild.properties;
                    const [, language = 'plaintext'] = /language-(\w+)/.exec(String(className) || '') ?? [];
                    return <CodeBlock code={firstChild.children[0].value} language={language} {...rest}/>;
                }
                return <pre {...rest}>{children}</pre>;
            },
        };
    }, []);
    return (<ReactMarkdown allowedElements={allowedHTMLElements} className={styles.MarkdownContent} components={components} remarkPlugins={remarkPlugins(limitedMarkdown)} rehypePlugins={rehypePlugins(html)}>
      {children}
    </ReactMarkdown>);
});
