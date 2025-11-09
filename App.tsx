
import React, { useState, useCallback, useRef } from 'react';
import { ChatHistory } from './components/ChatHistory';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { sendMessageToGemini, generateImageWithGemini } from './services/geminiService';
import { Message, AttachedFile } from './types';
import { fileToGenerativePart, isTextFile } from './utils/fileUtils';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ type: 'text', content: "Hello! I'm Gemini. You can ask me questions, attach images or files, or ask me to generate an image. How can I help you today?" }],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async (prompt: string, attachedFile: AttachedFile | null, isImageGenerationMode: boolean) => {
    if (!prompt && !attachedFile) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      role: 'user',
      parts: [],
    };
    if (prompt) {
      userMessage.parts.push({ type: 'text', content: prompt });
    }
    if (attachedFile) {
        userMessage.parts.push({ type: 'file', ...attachedFile });
    }

    setMessages(prev => [...prev, userMessage]);

    try {
        let response: Message;
        if (isImageGenerationMode) {
            response = await generateImageWithGemini(prompt);
        } else {
            response = await sendMessageToGemini(prompt, attachedFile);
        }
        setMessages(prev => [...prev, response]);
    } catch (e: any) {
        const errorMessage = e.message || 'An unknown error occurred.';
        setError(errorMessage);
        setMessages(prev => [...prev, { role: 'model', parts: [{ type: 'text', content: `Error: ${errorMessage}` }] }]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] text-white font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6" ref={chatHistoryRef}>
        <div className="max-w-4xl mx-auto">
            <ChatHistory messages={messages} />
        </div>
      </main>
      <footer className="bg-[#0D1117] border-t border-gray-700">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            {error && <div className="text-red-400 text-center mb-2">{error}</div>}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;
