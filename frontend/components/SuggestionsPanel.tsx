
'use client'; 

import React, { useState } from 'react'; 
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'; 

interface Suggestion {
    original: string;
    suggested: string;
    reason: string;
}

interface SuggestionsPanelProps {
    suggestions: Suggestion[]; 
    applySuggestion: (original: string, suggested: string) => void; 
    colors: { text: string }; 
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
    suggestions,
    applySuggestion,
    colors
}) => {
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // Internal state for toggling


    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="mt-4">
            <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`flex items-center text-sm font-medium ${colors.text} hover:underline`}
            >
                <MessageCircle className="w-4 h-4 mr-1" />
                {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions for Improvement'}
                {showSuggestions ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>

            {showSuggestions && (
                <div className="mt-3 bg-white rounded-md border border-gray-200 p-3">
                    <h4 className="font-medium text-gray-800 text-sm mb-2">Suggested Improvements</h4>
                    <ul className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-700">
                                        Replace "<span className="text-red-600">{suggestion.original}</span>" with "<span className="text-green-600">{suggestion.suggested}</span>"
                                    </span>
                                    <button
                                        onClick={() => applySuggestion(suggestion.original, suggestion.suggested)}
                                        className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded ml-2"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <p className="text-gray-600 text-xs">{suggestion.reason}</p>
                            </li>
                        ))}
                         
                    </ul>
                </div>
            )}

             {showSuggestions && suggestions.length === 0 && (
                <div className="mt-3 bg-white rounded-md border border-gray-200 p-3">
                    <p className="text-sm text-gray-600">
                         No specific suggestions available. Consider reviewing your overall tone and language.
                    </p>
                </div>
            )}

        </div>
    );
};

export default SuggestionsPanel;