import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, ChatMessage } from '../types';
import { marked } from 'marked';

interface ChatbotProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    suggestedPrompts: string[];
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
    </div>
);

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const { direction } = useLanguage();
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const alignClass = isUser ? 'self-end' : 'self-start';
    const bgClass = isUser ? 'bg-blue-600' : isSystem ? 'bg-slate-700/80' : 'bg-slate-700';
    const textAlign = direction === 'rtl' ? (isUser ? 'text-right' : 'text-right') : (isUser ? 'text-left' : 'text-left');
    
    const parsedText = isUser ? message.text : marked.parse(message.text);

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 text-white ${alignClass} ${bgClass} ${textAlign} animate-fade-in`}>
                <div 
                    className="prose prose-sm prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ __html: parsedText as string }}
                />
            </div>
        </div>
    );
};

const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, isLoading, suggestedPrompts }) => {
    const { t, direction } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isLoading) {
            onSendMessage(userInput.trim());
            setUserInput('');
        }
    };
    
    const handlePromptClick = (prompt: string) => {
        if (!isLoading) {
            onSendMessage(prompt);
        }
    }

    return (
        <>
            <div dir={direction} className={`chat-window fixed bottom-24 right-4 sm:right-8 w-[calc(100vw-2rem)] max-w-sm h-[65vh] max-h-[550px] bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 flex flex-col z-50 ${isOpen ? '' : 'hidden'}`}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900/50 rounded-t-xl">
                    <h3 className="font-bold text-white bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">{t('chatbot.title')}</h3>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4 chat-messages">
                    {messages.map((msg, index) => (
                        <Message key={index} message={msg} />
                    ))}
                    {isLoading && <div className="self-start"><TypingIndicator /></div>}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Prompts */}
                {!isLoading && suggestedPrompts.length > 0 && (
                    <div className="flex-shrink-0 p-2 border-t border-slate-700">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestedPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-3 py-1 bg-slate-700 text-pink-300 text-xs rounded-full hover:bg-slate-600 transition-colors animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {/* Input */}
                <form onSubmit={handleFormSubmit} className="flex-shrink-0 p-3 border-t border-slate-700 flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={t('chatbot.placeholder')}
                        className="flex-grow bg-slate-700/80 border-slate-600 rounded-full shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-700 text-white disabled:from-slate-600 disabled:to-slate-700 transition-all"
                        aria-label={t('chatbot.send')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`chatbot-fab fixed bottom-6 right-4 sm:right-8 w-14 h-14 bg-gradient-to-br from-purple-700 to-pink-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 ${isOpen ? 'open' : ''}`}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>
        </>
    );
};

export default Chatbot;