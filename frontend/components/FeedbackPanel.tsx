'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, AlertCircle, Info, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import ImpactStatisticsPanel from './ImpactStatisticsPanel';
import SuggestionsPanel from './SuggestionsPanel';


interface DetectionResult {
    text: string;
    is_misogynistic: boolean;
    score_misogyny?: number;
    error?: string;
    rule_applied?: string | null;
}


interface Suggestion {
    original: string;
    suggested: string;
    reason: string;
}


interface StatisticItem {
    title: string;
    value: string;
    source: string;
    info: string;
    impact: string;
    action: string;
}

interface FeedbackPanelProps {
    feedback: string;
    isFlagged: boolean;
    severity: 'low' | 'medium' | 'high' | 'none';
    misogynyScore: number;
    suggestions: Suggestion[];
    applySuggestion: (original: string, suggested: string) => void;
    showStatistics: boolean;
    setShowStatistics: (show: boolean) => void;
    flaggedCount: number;
    misogynisticStatisticsData: StatisticItem[];
    statsLoading: boolean;
    statsError: string | null;
    onDismiss?: () => void; 
    onRescan?: () => void;  
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
    feedback,
    isFlagged,
    severity,
    misogynyScore,
    suggestions,
    applySuggestion,
    showStatistics,
    setShowStatistics,
    flaggedCount,
    misogynisticStatisticsData,
    statsLoading,
    statsError,
    onDismiss,
    onRescan,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getSeverityInfo = () => {
        switch (severity) {
            case 'high': 
                return { 
                    border: 'border-red-500', 
                    bg: 'bg-red-50', 
                    text: 'text-red-700', 
                    lightText: 'text-red-600',
                    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                    gradientFrom: 'from-red-500/10',
                    gradientTo: 'to-red-500/5',
                    progressColor: 'bg-red-600',
                    title: 'High Risk Content Detected'
                };
            case 'medium': 
                return { 
                    border: 'border-orange-400', 
                    bg: 'bg-orange-50', 
                    text: 'text-orange-700', 
                    lightText: 'text-orange-500',
                    icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
                    gradientFrom: 'from-orange-400/10',
                    gradientTo: 'to-orange-400/5',
                    progressColor: 'bg-orange-500',
                    title: 'Medium Risk Content Detected'
                };
            case 'low': 
                return { 
                    border: 'border-yellow-400', 
                    bg: 'bg-yellow-50', 
                    text: 'text-yellow-700', 
                    lightText: 'text-yellow-500',
                    icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
                    gradientFrom: 'from-yellow-400/10',
                    gradientTo: 'to-yellow-400/5',
                    progressColor: 'bg-yellow-400',
                    title: 'Low Risk Content Detected'
                };
            default: 
                return { 
                    border: 'border-green-400', 
                    bg: 'bg-green-50', 
                    text: 'text-green-700', 
                    lightText: 'text-green-600',
                    icon: <Check className="w-5 h-5 text-green-600" />,
                    gradientFrom: 'from-green-400/10',
                    gradientTo: 'to-green-400/5',
                    progressColor: 'bg-green-500',
                    title: 'Content Analysis Complete'
                };
        }
    };
    
    const styleInfo = getSeverityInfo();
    const scorePercentage = Math.round(misogynyScore * 100);

    if (isCollapsed) {
        return (
            <div className={`
                p-3 border-t ${styleInfo.bg} transition-all duration-300 shadow-sm
                bg-gradient-to-b ${styleInfo.gradientFrom} ${styleInfo.gradientTo}
            `}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {styleInfo.icon}
                        <h3 className={`font-medium ${styleInfo.text} ml-2`}>
                            {isFlagged ? styleInfo.title : "Content Analysis Complete"}
                        </h3>
                        {isFlagged && (
                            <div className="ml-3 px-2 py-0.5 rounded-full bg-white/80 border border-gray-200">
                                <span className={`text-xs font-medium ${styleInfo.lightText}`}>
                                    {scorePercentage}% risk
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => setIsCollapsed(false)}
                            className="p-1 rounded-full hover:bg-white/60 transition-colors"
                            aria-label="Expand panel"
                        >
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                        {onDismiss && (
                            <button 
                                onClick={onDismiss}
                                className="p-1 rounded-full hover:bg-white/60 transition-colors"
                                aria-label="Dismiss panel"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`
            p-4 border-t ${styleInfo.bg} transition-all duration-300 shadow-sm
            bg-gradient-to-b ${styleInfo.gradientFrom} ${styleInfo.gradientTo}
        `}>
            <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                    {styleInfo.icon}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${styleInfo.text} mb-1`}>
                            {isFlagged ? styleInfo.title : "Content Analysis Complete"}
                        </h3>
                        <div className="flex space-x-1">
                            {onRescan && (
                                <button 
                                    onClick={onRescan}
                                    className="p-1 rounded-full hover:bg-white/60 transition-colors"
                                    aria-label="Rescan content"
                                >
                                    <RefreshCw className="w-4 h-4 text-gray-500" />
                                </button>
                            )}
                            <button 
                                onClick={() => setIsCollapsed(true)}
                                className="p-1 rounded-full hover:bg-white/60 transition-colors"
                                aria-label="Collapse panel"
                            >
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            </button>
                            {onDismiss && (
                                <button 
                                    onClick={onDismiss}
                                    className="p-1 rounded-full hover:bg-white/60 transition-colors"
                                    aria-label="Dismiss panel"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <p className={`${styleInfo.text} text-sm`}>
                        {feedback}
                    </p>

                    {/* Score and Severity Display */}
                    {isFlagged && (
                        <div className="mt-4 bg-white/50 rounded-lg p-3 border border-gray-200/60">
                            {/* Misogyny Score */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-700 flex items-center">
                                        Misogyny Likelihood
                                        <button 
                                            className="ml-1 text-gray-400 hover:text-gray-600"
                                            aria-label="Information about misogyny likelihood"
                                        >
                                            <Info className="w-3 h-3" />
                                        </button>
                                    </span>
                                    <span className={`text-xs font-medium ${scorePercentage > 70 ? 'text-red-600' : scorePercentage > 40 ? 'text-orange-500' : 'text-yellow-500'}`}>
                                        {scorePercentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${styleInfo.progressColor}`}
                                        style={{ width: `${scorePercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Severity Indicator with improved styling */}
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-700">Severity Level</span>
                                    <span className={`text-xs font-medium ${styleInfo.text}`}>
                                        {severity === 'high' ? 'High Impact' :
                                        severity === 'medium' ? 'Medium Impact' :
                                        'Low Impact'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
                                    <div className="bg-yellow-400 h-full" style={{ width: '33.33%' }}></div>
                                    <div className="bg-orange-500 h-full" style={{ width: '33.33%' }}></div>
                                    <div className="bg-red-600 h-full" style={{ width: '33.33%' }}></div>
                                </div>
                                <div className="w-full flex justify-between mt-1">
                                    <div className="w-1/3 flex justify-center">
                                        <div className={`w-2 h-2 rounded-full ${severity === 'low' ? 'bg-black' : 'bg-transparent'}`}></div>
                                    </div>
                                    <div className="w-1/3 flex justify-center">
                                        <div className={`w-2 h-2 rounded-full ${severity === 'medium' ? 'bg-black' : 'bg-transparent'}`}></div>
                                    </div>
                                    <div className="w-1/3 flex justify-center">
                                        <div className={`w-2 h-2 rounded-full ${severity === 'high' ? 'bg-black' : 'bg-transparent'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggestions Panel with improved spacing */}
                    {isFlagged && suggestions.length > 0 && (
                        <div className="mt-4">
                            <SuggestionsPanel
                                suggestions={suggestions}
                                applySuggestion={applySuggestion}
                                colors={{ text: styleInfo.text }}
                            />
                        </div>
                    )}

                    {/* Statistics Panel */}
                    {isFlagged && (
                        <div className="mt-4">
                            <ImpactStatisticsPanel
                                showStatistics={showStatistics}
                                setShowStatistics={setShowStatistics}
                                severity={severity}
                                colors={{ text: styleInfo.text }}
                                flaggedCount={flaggedCount}
                                misogynisticStatisticsData={misogynisticStatisticsData}
                                statsLoading={statsLoading}
                                statsError={statsError}
                                misogynyScore={misogynyScore}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackPanel;