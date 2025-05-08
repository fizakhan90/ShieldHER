'use client'; // Mark as Client Component

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Check, Send, RefreshCcw, AlertCircle, Info } from 'lucide-react';

// --- Configuration ---
const API_URL = 'http://localhost:5000/detect'; // !! Match your Flask backend !!
const DEBOUNCE_DELAY = 500; // Half a second

// --- Type for the API Response ---
interface DetectionResult {
    text: string;
    is_misogynistic: boolean;
    score: number;
    error?: string;
}

export default function HomePage() {
    // State with explicit types
    const [inputText, setInputText] = useState<string>('');
    const [isFlagged, setIsFlagged] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'none'>('none');
    const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);

    // Ref with explicit type for the HTMLDivElement
    const textInputRef = useRef<HTMLDivElement>(null);

    // --- Async function to call the API ---
    const checkTextWithApi = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Body: ${errorBody}`);
            }

            const result: DetectionResult = await response.json();
            console.log("Detection Result:", result);

            setIsFlagged(result.is_misogynistic);
            
            // Set severity based on score (adjust thresholds as needed)
            if (result.is_misogynistic) {
                if (result.score > 0.7) setSeverity('high');
                else if (result.score > 0.4) setSeverity('medium');
                else setSeverity('low');
                
                setFeedback(`This text contains potentially harmful language with ${Math.round(result.score * 100)}% confidence.`);
            } else {
                setSeverity('none');
                setFeedback("Text appears to be inclusive and respectful.");
            }
            
            if (result.error) {
                console.error("Backend reported error:", result.error);
            }
        } catch (error) {
            console.error("Error checking text:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setFeedback(`Connection error: ${errorMessage}`);
            setIsFlagged(false);
            setSeverity('none');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // useEffect hook to handle the API call with a timeout (debouncing)
    useEffect(() => {
        if (inputText.trim() === "") {
            setIsFlagged(false);
            setFeedback("");
            setSeverity('none');
            return;
        }

        const handler: NodeJS.Timeout = setTimeout(() => {
            checkTextWithApi(inputText);
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(handler);
        };
    }, [inputText]);

    // Handler for input events on the contenteditable div
    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        if (textInputRef.current && event.target instanceof HTMLDivElement) {
            setInputText(event.target.textContent || '');
        }
    };

    // Get color scheme based on severity
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
    
    const colors = getSeverityColors();

    // --- Clear the input area ---
    const handleClear = () => {
        if (textInputRef.current) {
            textInputRef.current.textContent = '';
            setInputText('');
            setIsFlagged(false);
            setFeedback('');
            setSeverity('none');
        }
    };

    // --- Render the UI using Tailwind Classes ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-800 mb-2">ShieldHER</h1>
                    <p className="text-lg text-gray-600">Detect and prevent online misogyny in real-time</p>
                </header>
                
                <main className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                                As you type, our AI analyzes your text for potentially harmful content and provides immediate feedback.
                                This technology can help create safer online spaces by identifying and reducing gender-based hate speech.
                            </p>
                        </div>
                    )}
                    
                    {/* Input Section */}
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
                                ref={textInputRef}
                                id="text-input"
                                className={`
                                    w-full min-h-[120px] outline-none text-gray-800 text-lg
                                    ${isFlagged ? `${colors.text} selection:bg-indigo-100` : 'text-gray-800'}
                                    empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400
                                `}
                                contentEditable="true"
                                data-placeholder="Start typing here or paste text to analyze..."
                                onInput={handleInput}
                                role="textbox"
                                aria-multiline="true"
                            />
                            
                            {/* Analysis Indicator */}
                            {isAnalyzing && (
                                <div className="absolute bottom-2 right-2 flex items-center text-sm text-indigo-600">
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                    Analyzing...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Area with enhanced visualization */}
                    {(feedback || inputText.trim() !== '') && (
                        <div className={`
                            p-4 border-t ${colors.bg} transition-all duration-300
                        `}>
                            <div className="flex items-start">
                                <div className="mr-3 mt-0.5">
                                    {colors.icon}
                                </div>
                                <div>
                                    <h3 className={`font-medium ${colors.text} mb-1`}>
                                        {severity === 'none' ? 'Analysis Result' : `Alert: Potentially Harmful Content Detected`}
                                    </h3>
                                    <p className={`${colors.text} text-sm`}>
                                        {feedback || (inputText.trim() !== '' ? 'Analyzing your text...' : '')}
                                    </p>
                                    
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
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            Powered by AI • Supporting SDG 5 & SDG 10
                        </div>
                        <div>
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                                onClick={() => inputText.trim() && checkTextWithApi(inputText)}
                                disabled={isAnalyzing || !inputText.trim()}
                            >
                                <Send className="w-4 h-4 mr-1" />
                                Analyze Text
                            </button>
                        </div>
                    </div>
                </main>
                
                {/* Project Context */}
                <div className="mt-8 text-center text-gray-600 text-sm">
                    <p>A hackathon project for gender equality & inclusive online spaces</p>
                </div>
            </div>
        </div>
    );
}