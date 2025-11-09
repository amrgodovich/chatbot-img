
import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-[#161B22] p-4 border-b border-gray-700">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-[#388BFD]"/>
                    <h1 className="text-xl font-bold text-white">Gemini Pro Chat</h1>
                </div>
            </div>
        </header>
    );
}
