'use client';

import React, { useState, JSX } from 'react';
import { BarChart2, ChevronDown, ChevronUp, ExternalLink, Heart, Shield, AlertTriangle, Users } from 'lucide-react';

// --- Type for Statistics Data (Keep) ---
interface StatisticItem {
    title: string;
    value: string;
    source: string;
    info: string;
    impact: string;
    action: string;
}

// --- Define a mapping from statistic title/type to an icon (Keep) ---
const statisticIcons: { [key: string]: JSX.Element } = {
    "Online Harassment": <AlertTriangle className="w-5 h-5 text-red-500" />,
    "Mental Health Impact": <Heart className="w-5 h-5 text-pink-500" />,
    "Professional Consequences": <Users className="w-5 h-5 text-blue-500" />,
    "Platform Response": <Shield className="w-5 h-5 text-purple-500" />,
};


// --- ImpactStatisticsPanelProps (Updated to use misogynyScore) ---
interface ImpactStatisticsPanelProps {
    showStatistics: boolean;
    setShowStatistics: (show: boolean) => void;
    severity: 'low' | 'medium' | 'high' | 'none';
    colors: { text: string; };
    flaggedCount: number;
    // --- Updated Score Prop ---
    misogynyScore: number; // Receive the single score
    // Keep data props
    misogynisticStatisticsData: StatisticItem[];
    statsLoading: boolean;
    statsError: string | null;
}

const ImpactStatisticsPanel: React.FC<ImpactStatisticsPanelProps> = ({
    showStatistics,
    setShowStatistics,
    severity, // Keep severity (useful for some context)
    colors,
    flaggedCount,
    // --- Use the single score ---
    misogynyScore,
    // Use data props
    misogynisticStatisticsData,
    statsLoading,
    statsError,
}) => {
    // Keep internal state for expanded stats and personal impact reflection
    const [expandedStat, setExpandedStat] = useState<number | null>(null);
    const [personalImpactShown, setPersonalImpactShown] = useState<boolean>(false);

    // Keep internal functions
    const toggleExpandStat = (index: number) => {
        setExpandedStat(expandedStat === index ? null : index);
    };

    const showPersonalImpact = () => {
        setPersonalImpactShown(true);
    };

    // --- Generate a dynamic introductory message (Updated for single score) ---
    const getIntroMessage = () => {
        // Base message about severity level
        let baseMessage = "The language detected ";
        if (severity === 'high') baseMessage += "has a high likelihood of being harmful";
        else if (severity === 'medium') baseMessage += "is moderately likely to be harmful";
        else if (severity === 'low') baseMessage += "has a low but notable likelihood of being harmful";
         else return "Understanding the impact of online misogyny:"; // Should not happen if panel only renders when flagged

        baseMessage += ", which highlights the real-world consequences of misogynistic language online.";

        return baseMessage;
    };


    return (
        <div className="mt-4">
            {/* Button to toggle statistics visibility (Keep) */}
            <button
                onClick={() => setShowStatistics(!showStatistics)}
                className={`flex items-center text-sm font-medium ${colors.text} hover:underline`}
            >
                <BarChart2 className="w-4 h-4 mr-1" />
                {showStatistics ? 'Hide Impact Statistics' : 'Show Impact Statistics'}
                {showStatistics ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </button>

            {/* Statistics Content Panel - Only render if showStatistics is true */}
            {showStatistics && (
                <div className="mt-3 bg-white rounded-md border border-gray-200 p-3 transition-all duration-300">
                    {/* Display loading or error state (Keep) */}
                    {statsLoading && (
                         <div className="text-center text-indigo-600 text-sm">Loading statistics...</div>
                    )}
                    {statsError && (
                         <div className="text-center text-red-600 text-sm">Error loading statistics: {statsError}</div>
                    )}

                    {/* Display statistics if not loading and no error (Keep) */}
                    {!statsLoading && !statsError && misogynisticStatisticsData.length > 0 && (
                        <> {/* Use fragment */}
                            {/* --- Dynamic Intro Message (Updated) --- */}
                             <p className="text-sm text-gray-700 mb-4 font-medium">
                                 {getIntroMessage()}
                             </p>

                            {/* Stats Header (Keep) */}
                            <div className="flex items-center justify-between mb-3 border-t pt-3 border-gray-100">
                                <h4 className="font-medium text-gray-800 text-sm">Key Impacts:</h4>
                                {/* --- Display Session Counter (Keep) --- */}
                                {flaggedCount > 0 && (
                                    <span className="text-xs text-indigo-600 font-semibold">
                                        Prompted to review: {flaggedCount} {flaggedCount === 1 ? 'time' : 'times'} this session
                                    </span>
                                )}
                            </div>

                            {/* UPDATED: Grid layout for statistics items */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {misogynisticStatisticsData.map((stat, index) => (
                                    <div
                                        key={index}
                                        className={`bg-gray-50 p-3 rounded-md border-l-4 transition-all duration-300 ${
                                            expandedStat === index
                                                ? 'border-indigo-500 shadow-md'
                                                : 'border-gray-200 hover:border-indigo-300 cursor-pointer'
                                        }`}
                                        onClick={() => toggleExpandStat(index)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                {/* --- Dynamically add the icon (Keep) --- */}
                                                <div className="mr-2">
                                                    {statisticIcons[stat.title] || <BarChart2 className="w-5 h-5 text-gray-500" />} {/* Fallback icon */}
                                                </div>
                                                <span className="text-sm font-medium text-indigo-700">{stat.title}</span>
                                            </div>
                                            <span className="text-lg font-bold text-indigo-800">{stat.value}</span>
                                        </div>

                                        <p className="text-xs text-gray-600 mt-1">{stat.info}</p>

                                        <div className={`overflow-hidden transition-all duration-300 ${
                                            expandedStat === index ? 'max-h-48 mt-3' : 'max-h-0'
                                        }`}>
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-sm text-indigo-700 font-medium mb-1">Why this matters:</p>
                                                <p className="text-xs text-gray-600 mb-2">{stat.impact}</p>

                                                <p className="text-sm text-indigo-700 font-medium mb-1">Consider this:</p>
                                                <p className="text-xs text-gray-600 mb-2">{stat.action}</p>

                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-400 italic">Source: {stat.source}</p>
                                                    <button className="text-xs flex items-center text-indigo-600 hover:text-indigo-800">
                                                        Learn more <ExternalLink className="w-3 h-3 ml-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Personal Impact Reflection Section (Keep) */}
                            {!personalImpactShown ? (
                                <div className="mt-4 bg-indigo-50 p-4 rounded-md border border-indigo-100 text-center">
                                    <p className="text-sm text-indigo-700 font-medium mb-2">
                                        How might your words affect someone you care about?
                                    </p>
                                    <button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                        onClick={showPersonalImpact}
                                    >
                                        Show me
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 bg-indigo-50 p-4 rounded-md border border-indigo-100">
                                    <p className="text-sm text-indigo-700 font-medium mb-2">
                                        Personal Impact Reflection
                                    </p>
                                    <p className="text-xs text-gray-700 mb-3">
                                        Words like these could impact:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-white p-2 rounded shadow-sm text-center">
                                            <p className="text-xs font-medium text-gray-700">Your sister</p>
                                        </div>
                                        <div className="bg-white p-2 rounded shadow-sm text-center">
                                            <p className="text-xs font-medium text-gray-700">Your mother</p>
                                        </div>
                                        <div className="bg-white p-2 rounded shadow-sm text-center">
                                            <p className="text-xs font-medium text-gray-700">Your friend</p>
                                        </div>
                                        <div className="bg-white p-2 rounded shadow-sm text-center">
                                            <p className="text-xs font-medium text-gray-700">Your colleague</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 italic">
                                        When we post harmful content online, we often forget that real people - including those we care about - may see it.
                                    </p>
                                </div>
                            )}

                            {/* Concluding statement (Keep) */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-600">
                                   Being mindful of our words helps create safer digital spaces for everyone.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Message if data is loaded but empty (Keep) */}
                     {!statsLoading && !statsError && misogynisticStatisticsData.length === 0 && showStatistics && (
                          <div className="text-center text-gray-600 text-sm">No statistics available.</div>
                     )}
                </div>
            )}
        </div>
    );
};

export default ImpactStatisticsPanel;