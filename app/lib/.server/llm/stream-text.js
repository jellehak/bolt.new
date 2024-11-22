import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
export function streamText(messages, env, options) {
    return _streamText({
        model: getAnthropicModel(getAPIKey(env)),
        system: getSystemPrompt(),
        maxTokens: MAX_TOKENS,
        headers: {
            'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
        },
        messages: convertToCoreMessages(messages),
        ...options,
    });
}
