// frontend/components/FeedbackPanel.tsx

'use client'; // Use if using client-side features (conditional rendering, passing onClick)

import React, { JSX } from 'react'; // Import React and JSX for icon type
import { AlertTriangle, Check, AlertCircle } from 'lucide-react'; // Import icons
import ImpactStatisticsPanel from './ImpactStatisticsPanel'; // Import the Statistics Panel
import SuggestionsPanel from './SuggestionsPanel'; // Import the Suggestions Panel

// Define types for props
interface DetectionResult { // Redefine here or import if in shared types file
    text: string;
    is_misogynistic: boolean;
    score_toxic: number;
    score_insult: number;
    error?: string;
}

interface Suggestion { // Redefine here or import
    original: string;
    suggested: string;
    reason: string;
}

interface FeedbackPanelProps {
    feedback: string;
    isFlagged: boolean;
    severity: 'low' | 'medium' | 'high' | 'none';
    toxicScore: number;
    insultScore: number;
    suggestions: Suggestion[];
    applySuggestion: (original: string, suggested: string) => void; // Pass this down
    // Props for Statistics Panel
    showStatistics: boolean;
    setShowStatistics: (show: boolean) => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
    feedback,
    isFlagged,
    severity,
    toxicScore,
    insultScore,
    suggestions,
    applySuggestion, // Receive the function to pass down
    showStatistics,
    setShowStatistics,
}) => {

    // Get color scheme based on severity - This logic can stay here
    const getSeverityColors = () => {
        switch (severity) {
            case 'high':
                return {
                    border: 'border-red-500',
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                };
            case 'medium':
                return {
                    border: 'border-orange-400',
                    bg: 'bg-orange-50',
                    text: 'text-orange-700',
                    icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
                };
            case 'low':
                return {
                    border: 'border-yellow-400',
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
                };
            default:
                return {
                    border: 'border-green-400',
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    icon: <Check className="w-5 h-5 text-green-600" />,
                };
        }
    };

    const colors = getSeverityColors(); // Get colors based on current severity state

    // Only render if there's feedback or analysis ongoing (handled by parent now)
    // The parent checks `(feedback || inputText.trim() !== '')` before rendering this component

    return (
        <div className={`
            p-4 border-t ${colors.bg} transition-all duration-300
        `}>
            <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                    {colors.icon}
                </div>
                <div className="flex-1">
                    <h3 className={`font-medium ${colors.text} mb-1`}>
                        {severity === 'none' ? 'Analysis Result' : `Alert: Potentially Harmful Content Detected`}
                    </h3>
                    <p className={`${colors.text} text-sm`}>
                        {feedback} {/* Display feedback from parent */}
                    </p>

                    {/* Score Details - Show both toxic and insult scores */}
                    {isFlagged && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {/* Toxic Score */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-700">Toxicity</span>
                                    <span className="text-xs font-medium text-gray-700">{Math.round(toxicScore * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full bg-red-600"
                                        style={{ width: `${toxicScore * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Insult Score */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-700">Insult</span>
                                    <span className="text-xs font-medium text-gray-700">{Math.round(insultScore * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full bg-orange-500"
                                        style={{ width: `${insultScore * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Severity Indicator (only show if flagged) */}
                    {isFlagged && (
                        <div className="mt-3 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                    className={`h-2.5 rounded-full ${
                                        severity === 'high' ? 'bg-red-600' :
                                        severity === 'medium' ? 'bg-orange-500' :
                                        'bg-yellow-400'
                                    }`}
                                    style={{ width: `${severity === 'high' ? '100%' : severity === 'medium' ? '60%' : '30%'}` }}
                                ></div>
                            </div>
                            <span className={`text-xs font-medium ${colors.text}`}>
                                {severity === 'high' ? 'High Severity' :
                                 severity === 'medium' ? 'Medium Severity' :
                                 'Low Severity'}
                            </span>
                        </div>
                    )}

                    {/* Suggestions Panel - Pass suggestions and apply function */}
                     {isFlagged && (
                         <SuggestionsPanel
                             suggestions={suggestions}
                             applySuggestion={applySuggestion} // Pass the function down
                             colors={{ text: colors.text }} // Pass just the text color needed
                         />
                     )}


                    {/* Statistics Panel - Pass state and setState function */}
                     {isFlagged && (
                         <ImpactStatisticsPanel
                             showStatistics={showStatistics}
                             setShowStatistics={setShowStatistics}
                             severity={severity} // Pass severity down
                             colors={{ text: colors.text }} // Pass just text color, maybe others needed
                         />
                     )}

                </div>
            </div>
        </div>
    );
};

export default FeedbackPanel;