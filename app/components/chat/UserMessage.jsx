import { modificationsRegex } from '~/utils/diff';
import { Markdown } from './Markdown';
export function UserMessage({ content }) {
    return (<div className="overflow-hidden pt-[4px]">
      <Markdown limitedMarkdown>{sanitizeUserMessage(content)}</Markdown>
    </div>);
}
function sanitizeUserMessage(content) {
    return content.replace(modificationsRegex, '').trim();
}
