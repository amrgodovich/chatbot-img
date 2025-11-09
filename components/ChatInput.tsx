
import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AttachedFile } from '../types';
import { PaperclipIcon, SendIcon, SparklesIcon, XIcon } from './icons';
import { readFile } from '../utils/fileUtils';

interface ChatInputProps {
  onSendMessage: (prompt: string, attachedFile: AttachedFile | null, isImageGenerationMode: boolean) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isImageGenerationMode, setIsImageGenerationMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileData = await readFile(file);
        setAttachedFile(fileData);
      } catch (error) {
        console.error("Error reading file:", error);
        // Handle error display to user
      }
    }
  };

  const handleSend = () => {
    if (isLoading || (!prompt.trim() && !attachedFile)) return;
    onSendMessage(prompt, attachedFile, isImageGenerationMode);
    setPrompt('');
    setAttachedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const removeAttachment = () => {
      setAttachedFile(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }

  return (
    <div className="bg-[#161B22] border border-gray-600 rounded-xl p-2 flex flex-col gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#388BFD]">
      {attachedFile && (
        <div className="relative w-fit bg-gray-700 p-2 rounded-lg ml-12">
            {attachedFile.mimeType.startsWith('image/') ? (
                <img src={attachedFile.url} alt={attachedFile.name} className="h-16 w-16 object-cover rounded-md" />
            ) : (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <PaperclipIcon className="w-5 h-5" />
                    <span>{attachedFile.name}</span>
                </div>
            )}
            <button onClick={removeAttachment} className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-0.5 hover:bg-red-500 transition-colors">
                <XIcon className="w-4 h-4" />
            </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-[#388BFD] transition-colors rounded-full"
          aria-label="Attach file"
          disabled={isImageGenerationMode || isLoading}
        >
          <PaperclipIcon className="w-6 h-6" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isImageGenerationMode || isLoading}
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isImageGenerationMode ? "Describe the image you want to create..." : "Ask me anything..."}
          className="flex-1 bg-transparent resize-none outline-none text-white placeholder-gray-500 text-base py-2"
          rows={1}
          style={{ maxHeight: '120px' }}
        />
        <button
            onClick={() => setIsImageGenerationMode(prev => !prev)}
            className={`p-2 rounded-full transition-colors ${isImageGenerationMode ? 'text-[#388BFD] bg-blue-900/50' : 'text-gray-400 hover:text-[#388BFD]'}`}
            aria-label="Toggle image generation"
            disabled={isLoading || !!attachedFile}
        >
            <SparklesIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleSend}
          disabled={isLoading || (!prompt.trim() && !attachedFile)}
          className="bg-[#388BFD] text-white p-2 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
          aria-label="Send message"
        >
          {isLoading ? (
             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SendIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};
