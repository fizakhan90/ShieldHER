// frontend/components/InfoPanel.tsx

'use client'; // Necessary if this component uses client-side features (like onClick, useState)
               // In this case, it uses onClick and useState (in parent), so good practice.

import React from 'react'; // Import React
import { Info } from 'lucide-react'; // Import icon

// Define the props this component expects
interface InfoPanelProps {
    showInfoPanel: boolean;
    setShowInfoPanel: (show: boolean) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ showInfoPanel, setShowInfoPanel }) => {
    return (
        <> {/* Use Fragment if you don't need a wrapping div */}
            {/* Info Panel - Toggle */}
            <div className="bg-indigo-100 p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Info className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-indigo-800 font-medium">Online Misogyny Detection Simulator</span>
                </div>
                <button
                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                    {showInfoPanel ? 'Hide Info' : 'What is this?'}
                </button>
            </div>

            {/* Info Panel - Content */}
            {showInfoPanel && (
                <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                    <h3 className="font-medium text-indigo-800 mb-2">About this Simulator</h3>
                    <p className="text-gray-700 text-sm mb-2">
                        This tool demonstrates real-time detection of misogynistic language, supporting SDG 5 (Gender Equality)
                        and SDG 10 (Reduced Inequalities).
                    </p>
                    <p className="text-gray-700 text-sm">
                        As you type, our AI analyzes your text for potentially harmful content and provides immediate feedback
                        and suggestions for improvement. This technology can help create safer online spaces by identifying
                        and reducing gender-based hate speech.
                    </p>
                </div>
            )}
        </>
    );
};

export default InfoPanel;