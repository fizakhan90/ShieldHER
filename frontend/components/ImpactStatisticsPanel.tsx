// frontend/components/ImpactStatisticsPanel.tsx

'use client'; // This component uses client-side features (useState, onClick)

import React, { useState, JSX } from 'react'; // Import React, useState, and JSX type
import { BarChart2, ChevronDown, ChevronUp, ExternalLink, Heart, Shield, AlertTriangle, Users } from 'lucide-react'; // Import all necessary icons

// Define type for statistics data (UPDATED to match the new data structure)
interface StatisticItem {
    title: string;
    value: string;
    source: string;
    info: string;
    icon: JSX.Element; // Added icon
    impact: string; // Added impact message
    action: string; // Added action message
}

// Statistics about online misogyny - Keep this data array here (Matches your provided data)
const misogynisticStatistics: StatisticItem[] = [
    {
        title: "Online Harassment",
        value: "73%",
        source: "Pew Research Center",
        info: "of women have experienced some form of online harassment, with women being twice as likely as men to experience sexual harassment online.",
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        impact: "This means that most women you know have likely faced harassment simply for existing online.",
        action: "Think about how your words might contribute to this experience."
    },
    {
        title: "Mental Health Impact",
        value: "51%",
        source: "Women's Media Center",
        info: "of women who experienced online abuse reported suffering from stress, anxiety, or panic attacks as a result.",
        icon: <Heart className="w-5 h-5 text-pink-500" />,
        impact: "Words online can cause real psychological harm that affects daily life.",
        action: "Consider: would you say this to someone's face knowing it might cause them anxiety?"
    },
    {
        title: "Professional Consequences",
        value: "38%",
        source: "Amnesty International",
        info: "of women who experienced online abuse reported self-censoring their online posts to avoid harassment, limiting their professional visibility.",
        icon: <Users className="w-5 h-5 text-blue-500" />,
        impact: "This silencing effect means important voices are missing from online conversations.",
        action: "Your words could be preventing someone from sharing their expertise or perspective."
    },
    {
        title: "Platform Response",
        value: "27%",
        source: "UN Women",
        info: "of women who reported online abuse said platforms took action against their abusers, highlighting the gap in protection mechanisms.",
        icon: <Shield className="w-5 h-5 text-purple-500" />,
        impact: "With limited platform protection, individual behavior change is crucial for safer spaces.",
        action: "You can be part of the solution by choosing respectful language."
    }
];

// Define the props this component expects (Same as before)
interface ImpactStatisticsPanelProps {
    showStatistics: boolean;
    setShowStatistics: (show: boolean) => void;
    severity: 'low' | 'medium' | 'high' | 'none'; // Still received, currently not directly used in rendering
    colors: { text: string; }; // Needs text color for the toggle button
}

// Component using functional component syntax with explicit props type
const ImpactStatisticsPanel: React.FC<ImpactStatisticsPanelProps> = ({
    showStatistics,
    setShowStatistics,
    severity, // Received but currently not directly used in the provided JSX logic
    colors
}) => {
    // Added internal state for expanded stats and personal impact reflection
    const [expandedStat, setExpandedStat] = useState<number | null>(null);
    const [personalImpactShown, setPersonalImpactShown] = useState<boolean>(false);

    // Added internal functions for toggling stat expansion and showing personal impact
    const toggleExpandStat = (index: number) => {
        setExpandedStat(expandedStat === index ? null : index);
    };

    const showPersonalImpact = () => {
        setPersonalImpactShown(true);
    };

    return (
        // The main div containing the statistics toggle button and the content panel
        <div className="mt-4">
            {/* Button to toggle statistics visibility */}
            <button
                onClick={() => setShowStatistics(!showStatistics)}
                // Use flex, items-center, text-sm, font-medium, dynamic text color from props
                className={`flex items-center text-sm font-medium ${colors.text} hover:underline`}
            >
                <BarChart2 className="w-4 h-4 mr-1" />
                {showStatistics ? 'Hide Impact Statistics' : 'Show Impact Statistics'}
                {showStatistics ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </button>

            {/* Statistics Content Panel - Only render if showStatistics is true */}
            {showStatistics && (
                <div className="mt-3 bg-white rounded-md border border-gray-200 p-3 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 text-sm">The Real Impact of Online Misogyny</h4>
                        <span className="text-xs text-gray-500">Why your words matter</span>
                    </div>

                    {/* List of individual statistics items */}
                    <div className="space-y-4">
                        {misogynisticStatistics.map((stat, index) => (
                            <div
                                key={index}
                                className={`bg-gray-50 p-3 rounded-md border-l-4 transition-all duration-300 ${
                                    expandedStat === index
                                        ? 'border-indigo-500 shadow-md' // Style for expanded item
                                        : 'border-gray-200 hover:border-indigo-300 cursor-pointer' // Style for collapsed/hover item
                                }`}
                                onClick={() => toggleExpandStat(index)} // Toggle expansion on click
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="mr-2">{stat.icon}</div> {/* Display the icon */}
                                        <span className="text-sm font-medium text-indigo-700">{stat.title}</span>
                                    </div>
                                    <span className="text-lg font-bold text-indigo-800">{stat.value}</span> {/* Display the value */}
                                </div>

                                {/* Display the base info paragraph */}
                                <p className="text-xs text-gray-600 mt-1">{stat.info}</p>

                                {/* Expanded content (Impact, Action, Source, Learn More) */}
                                <div className={`overflow-hidden transition-all duration-300 ${
                                    expandedStat === index ? 'max-h-48 mt-3' : 'max-h-0' // Control height for expansion
                                }`}>
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="text-sm text-indigo-700 font-medium mb-1">Why this matters:</p>
                                        <p className="text-xs text-gray-600 mb-2">{stat.impact}</p> {/* Display impact message */}

                                        <p className="text-sm text-indigo-700 font-medium mb-1">Consider this:</p>
                                        <p className="text-xs text-gray-600 mb-2">{stat.action}</p> {/* Display action message */}

                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-400 italic">Source: {stat.source}</p> {/* Display source */}
                                            {/* Link to learn more - Placeholder or actual link */}
                                            <button className="text-xs flex items-center text-indigo-600 hover:text-indigo-800">
                                                Learn more <ExternalLink className="w-3 h-3 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Personal Impact Reflection Section - Conditional Rendering */}
                    {!personalImpactShown ? (
                        <div className="mt-4 bg-indigo-50 p-4 rounded-md border border-indigo-100 text-center">
                            <p className="text-sm text-indigo-700 font-medium mb-2">
                                How might your words affect someone you care about?
                            </p>
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                onClick={showPersonalImpact} // Show the personal impact section on click
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
                            {/* Grid of relation examples */}
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

                    {/* Concluding statement */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                            These statistics highlight the real-world consequences of misogynistic language online.
                            By being mindful of our words, we can help create safer digital spaces for everyone.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImpactStatisticsPanel;