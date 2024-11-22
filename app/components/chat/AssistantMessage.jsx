import { memo } from 'react';
import { Markdown } from './Markdown';
export const AssistantMessage = memo(({ content }) => {
    return (<div className="overflow-hidden w-full">
      <Markdown html>{content}</Markdown>
    </div>);
});
