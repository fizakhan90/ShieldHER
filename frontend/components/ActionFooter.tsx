// frontend/components/ActionFooter.tsx

'use client'; // Use if using client-side features (onClick)

import React from 'react'; // Import React
import { Send } from 'lucide-react'; // Import icon

// Define the props this component expects
interface ActionFooterProps {
    inputText: string; // State from parent
    isAnalyzing: boolean; // State from parent
    checkTextWithApi: (text: string) => Promise<void>; // Function from parent
}

const ActionFooter: React.FC<ActionFooterProps> = ({
    inputText,
    isAnalyzing,
    checkTextWithApi
}) => {
    return (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div className="text-xs text-gray-500">
                Powered by AI • Supporting SDG 5 & SDG 10
            </div>
            <div>
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => inputText.trim() && checkTextWithApi(inputText)} // Trigger analysis
                    disabled={isAnalyzing || !inputText.trim()} // Disable button
                >
                    {isAnalyzing ? (
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                        <Send className="w-4 h-4 mr-1" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
                </button>
            </div>
        </div>
    );
};

export default ActionFooter;