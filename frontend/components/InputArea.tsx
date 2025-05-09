'use client'; // Use if using client-side features (ref, event handlers)

import React, { JSX, useRef } from 'react'; // Import useRef if used directly here, but we pass it in props
import { RefreshCcw, Loader2 } from 'lucide-react'; // Added Loader2 icon for better animation

// Define the props this component expects
interface InputAreaProps {
    textInputRef: React.RefObject<HTMLDivElement>; // Type for the ref
    inputText: string; // Read-only state from parent
    handleInput: (event: React.FormEvent<HTMLDivElement>) => void; // Event handler from parent
    handleClear: () => void; // Function from parent
    isAnalyzing: boolean; // State from parent
    isFlagged: boolean; // State from parent
    colors: { border: string; bg: string; text: string; icon: JSX.Element; }; // From parent (severity colors)
}

const InputArea: React.FC<InputAreaProps> = ({
    textInputRef,
    inputText,
    handleInput,
    handleClear,
    isAnalyzing,
    isFlagged,
    colors 
}) => {
    return (
        <div className="p-6">
            <div className="mb-2 flex justify-between items-center">
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">
                    Type or paste text to analyze
                </label>
                <button
                    onClick={handleClear}
                    className="text-sm text-gray-500 hover:text-indigo-600 flex items-center"
                >
                    <RefreshCcw className="w-3 h-3 mr-1" />
                    Clear
                </button>
            </div>
            
            {/* Keyboard simulator container with enhanced styling */}
            <div className={`
                relative border-2 rounded-lg p-4 min-h-[150px] mb-4
                transition-colors duration-300 ease-in-out
                ${isFlagged ? `${colors.border} ${colors.bg}` : 'border-gray-200 focus-within:border-indigo-500'}
                focus-within:ring-2 focus-within:ring-indigo-200
            `}>
                {/* Contenteditable div - The actual input area */}
                <div
                    ref={textInputRef} // Attach the ref passed from the parent
                    id="text-input"
                    className={`
                        w-full min-h-[120px] outline-none text-lg
                        ${isFlagged ? `${colors.text} selection:bg-indigo-100` : 'text-gray-800'}
                        empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400
                    `}
                    contentEditable="true" // Always allow editing
                    data-placeholder="Start typing here or paste text to analyze..."
                    onInput={handleInput} // Use event handler passed from the parent
                    role="textbox"
                    aria-multiline="true"
                />
                
                {/* Non-intrusive Analysis Indicator */}
                {isAnalyzing && (
                    <div className="absolute bottom-0 right-0 left-0 flex justify-center pb-2 pointer-events-none">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full shadow-sm">
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-indigo-700">Analyzing...</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Add a global style for the custom animation */}
            <style jsx global>{`
                @keyframes progress-indeterminate {
                    0% { width: 0%; margin-left: -20%; }
                    50% { width: 40%; margin-left: 20%; }
                    100% { width: 0%; margin-left: 100%; }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default InputArea;