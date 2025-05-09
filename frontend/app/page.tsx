// frontend/app/page.tsx

'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { AlertTriangle, Check, AlertCircle } from 'lucide-react'; // Keep icons used directly here


// --- Import the new components ---
import InfoPanel from '../components/InfoPanel';
import InputArea from '../components/InputArea';
import FeedbackPanel from '../components/FeedbackPanel'; // This will include Scores, Severity, Suggestions, Statistics
import ActionFooter from '../components/ActionFooter';

// Assuming you have a shared types file (optional but good practice)
// import { DetectionResult, Suggestion, StatisticItem } from '../types';

// --- Configuration ---
const API_URL = 'http://localhost:5000/detect'; // !! Match your Flask backend !!
const DEBOUNCE_DELAY = 500; // Half a second

// --- Type for the API Response (Updated to match new backend) ---
interface DetectionResult {
    text: string;
    is_misogynistic: boolean;
    score_misogyny?: number; // Updated score field name
    error?: string;
    rule_applied?: string | null;
}

// --- Type for suggestions (Keep) ---
interface Suggestion {
    original: string;
    suggested: string;
    reason: string;
}

// --- Type for Statistics Data (Needs to match backend /statistics endpoint response) ---
// Assuming this data is fetched and passed down
interface StatisticItem {
    title: string;
    value: string;
    source: string;
    info: string;
    impact: string; // Added impact message
    action: string; // Added action message
}


// --- Main Page Component ---
export default function HomePage() {
    // --- State ---
    const [inputText, setInputText] = useState<string>('');
    const [isFlagged, setIsFlagged] = useState<boolean>(false); // Is the text flagged overall?
    const [feedback, setFeedback] = useState<string>(''); // Main feedback message
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // Is the API call in progress?
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'none'>('none'); // Severity level
    const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false); // State for the info panel
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // Generated suggestions
    const [showStatistics, setShowStatistics] = useState<boolean>(false); // State for the statistics panel
    const [flaggedCount, setFlaggedCount] = useState<number>(0); // Session counter

    // --- Updated Score State ---
    const [misogynyScore, setMisogynyScore] = useState<number>(0); // Use a single score state


    // --- State for Statistics Data (Fetched from backend) ---
    const [misogynisticStatisticsData, setMisogynisticStatisticsData] = useState<StatisticItem[]>([]);
    const [statsLoading, setStatsLoading] = useState<boolean>(true); // Loading state for stats
    const [statsError, setStatsError] = useState<string | null>(null); // Error state for stats


    // --- Ref ---
    const textInputRef = useRef<HTMLDivElement>(null);


    // --- useEffect to Fetch Statistics Data on Mount (Keep) ---
    useEffect(() => {
        const fetchStatistics = async () => {
            const API_URL_STATISTICS = 'http://localhost:5000/statistics'; // Define URL here or import
            try {
                const response = await fetch(API_URL_STATISTICS);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: StatisticItem[] = await response.json();
                // You might need to manually add icons if your backend doesn't provide them
                // const dataWithIcons = data.map(item => ({
                //     ...item,
                //     icon: statisticIcons[item.title] || <BarChart2 className="w-5 h-5 text-gray-500" /> // Use your icon mapping
                // }));
                setMisogynisticStatisticsData(data);
                setStatsLoading(false);
            } catch (error) {
                console.error("Error fetching statistics:", error);
                setStatsError(`Failed to load statistics: ${String(error)}`);
                setStatsLoading(false);
            }
        };

        fetchStatistics(); // Call the fetch function

    }, []); // Empty dependency array means this effect runs only once on component mount


    // --- Generate suggestions based on flagged content (Updated to use misogynyScore) ---
    const generateSuggestions = (text: string, currentMisogynyScore: number): Suggestion[] => {
         const commonProblematicTerms = [
            { term: 'bitch', replacement: 'person', reason: 'Gender-specific derogatory term' },
            { term: 'slut', replacement: '[avoid judgment]', reason: 'Sexually judgmental term' },
            { term: 'whore', replacement: '[avoid judgment]', reason: 'Sexually judgmental term' },
            { term: 'girl', replacement: 'woman', reason: 'When referring to adult women, "woman" is more respectful' },
            { term: 'hysteric', replacement: 'upset', reason: 'Historically misogynistic term' },
            { term: 'emotional', replacement: 'passionate', reason: 'Often used to dismiss women\'s concerns' },
            { term: 'bossy', replacement: 'assertive', reason: 'Often applied negatively only to women' },
            { term: 'shrill', replacement: 'emphatic', reason: 'Typically used to criticize women\'s voices' },
            { term: 'nagging', replacement: 'persistent', reason: 'Often applied negatively to women' },
             // Add the specific rule-based phrases here if you have them in your backend
             // These rules might need adjustment based on the new model's behavior
             { term: 'women are dramatic', replacement: 'Some women are dramatic', reason: 'Avoid harmful stereotypes' },
             { term: 'typical women driver', replacement: 'driver', reason: 'Avoid harmful stereotypes' },
             { term: 'woman driver', replacement: 'driver', reason: 'Avoid harmful stereotypes' },
        ];

        const lowerText = text.toLowerCase();
        const generated: Suggestion[] = [];

        commonProblematicTerms.forEach(({ term, replacement, reason }) => {
             const regex = new RegExp(`\\b${term}\\b`, 'gi');
             const matches = text.match(regex);

            if (matches) {
                 if (!generated.some(s => s.original.toLowerCase() === term.toLowerCase())) {
                    generated.push({
                        original: matches[0],
                        suggested: replacement,
                        reason: reason
                    });
                 }
            }
        });

        // Add general suggestion if flagged by the backend AND no specific terms found
        // This ensures you still get a suggestion even for phrases the model flags but aren't in your specific list
        if (generated.length === 0 && isFlagged) {
             generated.push({
                original: "overall tone",
                suggested: "more neutral language",
                reason: "The current phrasing may come across as hostile or disrespectful"
            });
        }

        return generated;
    };


    // --- Async function to call the API (Updated to use misogynyScore) ---
    const checkTextWithApi = async (text: string) => {
        setIsAnalyzing(true);
         // Clear previous state related to analysis result before fetching
         setIsFlagged(false);
         setSeverity('none');
         setSuggestions([]); // Clear previous suggestions
         setShowStatistics(false); // Hide stats when re-analyzing


        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            // Handle non-OK responses more specifically
            if (!response.ok) {
                const errorBody = await response.text();
                let errorMsg = `HTTP error! status: ${response.status}`;
                 if (errorBody) errorMsg += `. Body: ${errorBody}`;
                throw new Error(errorMsg);
            }

            const result: DetectionResult = await response.json();
            console.log("Detection Result:", result);

            // --- Use the new score ---
            const currentMisogynyScore = result.score_misogyny ?? 0; // Use nullish coalescing for safety
            setMisogynyScore(currentMisogynyScore);
            setIsFlagged(result.is_misogynistic); // Use the boolean flag from backend

            // --- Determine severity based on the single misogyny score ---
            // Adjust these thresholds based on your tuning with the new model
            if (currentMisogynyScore > 0.8) setSeverity('high');
            else if (currentMisogynyScore > 0.5) setSeverity('medium');
            else if (currentMisogynyScore > 0.2) setSeverity('low'); // Lower threshold for 'low' severity? Test!
            else setSeverity('none');

            // --- Update feedback message and trigger features based on backend flag ---
             if (result.is_misogynistic) {
                 setFlaggedCount(prevCount => prevCount + 1);

                 let message = "This text contains potentially harmful language.";
                 // You could add info about the specific score if desired
                 // message += ` Misogyny likelihood: ${Math.round(currentMisogynyScore * 100)}%.`;
                 if (result.rule_applied) {
                     message += ` (Identified by rule: ${result.rule_applied})`; // Optional: indicate if rule triggered
                 }
                 setFeedback(message);

                 // Generate suggestions if flagged by the backend
                 const newSuggestions = generateSuggestions(text, currentMisogynyScore); // Pass the single score
                 setSuggestions(newSuggestions);
                 setShowStatistics(true); // Show statistics when content is flagged
             } else {
                 setFeedback("Text appears to be inclusive and respectful.");
                 setSuggestions([]); // Clear suggestions for non-flagged text
                 setShowStatistics(false); // Hide statistics for non-flagged text
             }

             if (result.error) {
                 console.error("Backend reported error:", result.error);
                 setFeedback(`Backend message: ${result.error}`); // Overwrite previous feedback
             }

        } catch (error) {
            console.error("Error checking text:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setFeedback(`Connection error: ${errorMessage}`); // Show connection/fetch errors
            setIsFlagged(false); // Ensure flag is off on error
            setSeverity('none'); // Ensure severity is none on error
            // Reset score on error
            setMisogynyScore(0);
        } finally {
            setIsAnalyzing(false); // End loading state
        }
    };


    // --- useEffect hook for debounced analysis (Keep) ---
    useEffect(() => {
        if (inputText.trim() === "") {
            setIsFlagged(false);
            setFeedback("");
            setSeverity('none');
            setSuggestions([]);
            setShowStatistics(false);
            setIsAnalyzing(false);
            setMisogynyScore(0); // Reset score when input is empty
            return;
        }

        setIsAnalyzing(true);
        const handler: NodeJS.Timeout = setTimeout(() => {
            checkTextWithApi(inputText);
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(handler);
        };

    }, [inputText]); // Effect re-runs when inputText changes


    // --- Handler for direct text input (contenteditable div) (Keep) ---
    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        if (textInputRef.current && event.currentTarget === textInputRef.current) {
            const currentText = event.currentTarget.textContent ?? '';
            setInputText(currentText);
        }
    };

    // --- Apply a suggestion (Keep) ---
    const applySuggestion = (original: string, suggested: string) => {
        if (textInputRef.current && textInputRef.current.textContent !== null) {
            const regex = new RegExp(`\\b${original}\\b`, 'gi');
            const newText = textInputRef.current.textContent.replace(regex, suggested);
            textInputRef.current.textContent = newText;
            setInputText(newText); // Trigger re-analysis via useEffect
        }
    };


     // --- Get color scheme based on severity (Keep) ---
     const getSeverityColors = () => {
        switch (severity) {
            case 'high': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
            case 'medium': return { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-700', icon: <AlertCircle className="w-5 h-5 text-orange-500" /> };
            case 'low': return { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <AlertCircle className="w-5 h-5 text-yellow-500" /> };
            default: return { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', icon: <Check className="w-5 h-5 text-green-600" /> };
        }
    };
    const colors = getSeverityColors(); // Get colors based on current severity state

    // --- Clear the input area (Keep) ---
    const handleClear = () => {
        if (textInputRef.current) {
            textInputRef.textContent = ''; // Clear the div content
            setInputText(''); // Clear the state (triggers useEffect cleanup)
            // Reset all analysis-related states
            setIsFlagged(false);
            setFeedback('');
            setSeverity('none');
            setSuggestions([]);
            setShowStatistics(false);
            setIsAnalyzing(false);
            setMisogynyScore(0); // Reset score on clear
        }
    };


    // --- Render the UI using the new components ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-800 mb-2">ShieldHER</h1>
                    <p className="text-lg text-gray-600">Detect and prevent online misogyny in real-time</p>
                </header>

                <main className="bg-white rounded-xl shadow-lg overflow-hidden">

                    {/* Info Panel - Use the component */}
                    <InfoPanel
                        showInfoPanel={showInfoPanel}
                        setShowInfoPanel={setShowInfoPanel}
                    />

                    {/* Input Section - Use the component */}
                    <InputArea
                        textInputRef={textInputRef}
                        inputText={inputText} // Pass input text state (read-only here)
                        handleInput={handleInput} // Pass the input handler
                        handleClear={handleClear} // Pass the clear handler
                        isAnalyzing={isAnalyzing} // Pass analyzing state
                        isFlagged={isFlagged} // Pass flagged state
                        colors={colors} // Pass severity colors
                    />

                    {/* Feedback Area - Use the component */}
                    {/* Only render FeedbackPanel if there's feedback OR if input is not empty OR analysis is happening */}
                    {(feedback || inputText.trim() !== '' || isAnalyzing) && (
                        <FeedbackPanel
                            feedback={feedback}
                            isFlagged={isFlagged}
                            severity={severity}
                            // --- Pass the single misogyny score ---
                            misogynyScore={misogynyScore}
                            suggestions={suggestions}
                            applySuggestion={applySuggestion}
                            showStatistics={showStatistics}
                            setShowStatistics={setShowStatistics}
                            flaggedCount={flaggedCount}
                            misogynisticStatisticsData={misogynisticStatisticsData} // Pass fetched data
                            statsLoading={statsLoading} // Pass loading state
                            statsError={statsError} // Pass error state
                        />
                    )}


                    {/* Action Footer - Use the component */}
                    <ActionFooter
                        inputText={inputText} // Pass input text state
                        isAnalyzing={isAnalyzing} // Pass analyzing state
                        checkTextWithApi={checkTextWithApi} // Pass the analysis trigger function
                    />

                </main>

                {/* Project Context */}
                <div className="mt-8 text-center text-gray-600 text-sm">
                    <p>A hackathon project for gender equality & inclusive online spaces</p>
                </div>
            </div>
        </div>
    );
}

// --- Global Styles are handled in styles/globals.css ---
// No need for the <style jsx global> block here anymore