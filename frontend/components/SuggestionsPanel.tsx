// frontend/components/SuggestionsPanel.tsx

'use client'; // Use if using client-side features (onClick, useState)

import React, { useState } from 'react'; // Import React and useState
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'; // Import icons

// Define types for suggestions
interface Suggestion {
    original: string;
    suggested: string;
    reason: string;
}

// Define the props this component expects
interface SuggestionsPanelProps {
    suggestions: Suggestion[]; // Array of suggestions from parent
    applySuggestion: (original: string, suggested: string) => void; // Function from parent
    colors: { text: string }; // Need text color from parent's severity colors
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
    suggestions,
    applySuggestion,
    colors
}) => {
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // Internal state for toggling

    // Use useEffect or check `suggestions.length` to decide initial show state
    // For now, let's default to false and user clicks to show
    // useEffect(() => {
    //     if (suggestions && suggestions.length > 0) {
    //         setShowSuggestions(true); // Auto-show if suggestions are generated
    //     } else {
    //         setShowSuggestions(false);
    //     }
    // }, [suggestions]); // Re-evaluate when suggestions change

    // Only render if there are suggestions
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
                         {/* This case should not be reached if suggestions.length > 0, but kept for robustness */}
                        {/* {suggestions.length === 0 && (
                             <li className="text-sm text-gray-600">
                                 No specific suggestions available. Consider reviewing your overall tone and language.
                             </li>
                         )} */}
                    </ul>
                </div>
            )}

            {/* Message if suggestions panel is shown but array is empty (shouldn't happen with the above logic) */}
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