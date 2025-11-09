
import React from 'react';
import { Message, MessagePart } from '../types';
import { BotIcon, UserIcon, PaperclipIcon } from './icons';

interface ChatMessageProps {
  message: Message;
}

const CodeBlock: React.FC<{ content: string }> = ({ content }) => (
    <div className="bg-black/50 rounded-md my-2">
        <div className="flex justify-between items-center px-4 py-1 bg-gray-800/80 rounded-t-md text-xs text-gray-400">
            <span>Code</span>
            <button onClick={() => navigator.clipboard.writeText(content)} className="hover:text-white">Copy</button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
            <code>{content}</code>
        </pre>
    </div>
);

const FormattedText: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const code = part.slice(3, -3).trim();
                    return <CodeBlock key={index} content={code} />;
                }
                return <p key={index} className="whitespace-pre-wrap">{part}</p>;
            })}
        </>
    );
};


const PartRenderer: React.FC<{ part: MessagePart }> = ({ part }) => {
    switch (part.type) {
        case 'text':
            return <FormattedText content={part.content} />;
        case 'image':
            return <img src={part.url} alt={part.alt || "generated image"} className="rounded-lg max-w-sm" />;
        case 'file':
            if (part.mimeType.startsWith('image/')) {
                return <img src={part.url} alt={part.name} className="rounded-lg max-w-xs" />;
            }
            return (
                <div className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg w-fit">
                    <PaperclipIcon className="w-5 h-5" />
                    <span>{part.name}</span>
                </div>
            );
    }
    return null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, parts } = message;
  const isModel = role === 'model';

  return (
    <div className={`flex items-start gap-4 ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
          <BotIcon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isModel ? 'items-start' : 'items-end'}`}>
        <div className={`rounded-2xl p-4 ${isModel ? 'bg-[#161B22] rounded-tl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
          <div className="space-y-3 text-base leading-relaxed">
            {parts.map((part, index) => <PartRenderer key={index} part={part}/>)}
          </div>
        </div>
      </div>
       {!isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};
