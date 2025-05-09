// frontend/app/page.tsx

'use client';

import { useState, useEffect, useRef, JSX } from 'react'; // Keep necessary hooks and JSX type
// No CSS module import needed
// Keep the Lucide icons used directly in this file (Check, AlertTriangle, AlertCircle)
import { AlertTriangle, Check, AlertCircle } from 'lucide-react';


// --- Import the new components ---
import InfoPanel from '../components/InfoPanel';
import InputArea from '../components/InputArea';
import FeedbackPanel from '../components/FeedbackPanel'; // This will include Scores, Severity, Suggestions, Statistics
import ActionFooter from '../components/ActionFooter';


// --- Configuration ---
const API_URL = 'http://localhost:5000/detect'; // !! Match your Flask backend !!
const DEBOUNCE_DELAY = 500; // Half a second

// --- Type for the API Response ---
// Ensure this matches what your backend actually returns
interface DetectionResult {
    text: string;
    is_misogynistic: boolean;
    score_toxic: number;
    score_insult: number;
    error?: string;
    rule_applied?: string | null; // Add rule_applied if backend returns it
}

// --- Type for suggestions ---
interface Suggestion { // Define the types here or import from a shared types file
    original: string;
    suggested: string;
    reason: string;
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
    // Removed showSuggestions state - SuggestionsPanel manages its own internal toggle
    const [toxicScore, setToxicScore] = useState<number>(0); // Score from backend
    const [insultScore, setInsultScore] = useState<number>(0); // Score from backend
    const [showStatistics, setShowStatistics] = useState<boolean>(false); // State for the statistics panel

    // --- Ref ---
    const textInputRef = useRef<HTMLDivElement>(null);

    // --- Generate suggestions based on flagged content ---
    // This logic stays in the parent as it depends on inputText and scores
    const generateSuggestions = (text: string, currentToxicScore: number, currentInsultScore: number): Suggestion[] => {
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
             { term: 'women are dramatic', replacement: 'Some women are dramatic', reason: 'Avoid harmful stereotypes' },
             { term: 'typical women driver', replacement: 'driver', reason: 'Avoid harmful stereotypes' },
             { term: 'woman driver', replacement: 'driver', reason: 'Avoid harmful stereotypes' }, // Add variations
        ];

        const lowerText = text.toLowerCase();
        const generated: Suggestion[] = [];

        commonProblematicTerms.forEach(({ term, replacement, reason }) => {
            // Use word boundaries (\b) to avoid matching "bitchen" in "kitchen" etc.
            // But for some terms like 'emotional' or 'nagging', you might omit \b if you want to catch variations like "overly emotional"
             const regex = new RegExp(`\\b${term}\\b`, 'gi'); // 'gi' for global, case-insensitive
             const matches = text.match(regex);

            if (matches) {
                 // Add suggestion only if it's not a duplicate term found multiple times
                 if (!generated.some(s => s.original.toLowerCase() === term.toLowerCase())) {
                    generated.push({
                        original: matches[0], // Use the actual matched term's case
                        suggested: replacement,
                        reason: reason
                    });
                 }
            }
        });

        // Add general suggestion if flagged but no specific terms found
        // Use thresholds for this check that are slightly lower than your flag thresholds
        // Or check if isFlagged is true and suggestions is empty after iterating terms
        // const isGenerallyToxic = currentToxicScore > 0.55; // Example threshold for general toxicity suggestion
        // const isGenerallyInsulting = currentInsultScore > 0.7; // Example threshold for general insult suggestion

        if (generated.length === 0 && isFlagged) { // Check if flagged but no specific terms were matched
             generated.push({
                original: "overall tone",
                suggested: "more neutral language",
                reason: "The current phrasing may come across as hostile or disrespectful"
            });
        }

        return generated;
    };

    // --- Async function to call the API ---
    // This logic stays in the parent
    const checkTextWithApi = async (text: string) => {
        setIsAnalyzing(true);
         // Clear previous state related to analysis result before fetching
         setIsFlagged(false);
         setSeverity('none');
         setSuggestions([]); // Clear previous suggestions
         setShowStatistics(false); // Hide stats when re-analyzing
         // Don't clear feedback here immediately, maybe show 'Analyzing...'

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

            // Update state with results from backend
            setToxicScore(result.score_toxic);
            setInsultScore(result.score_insult);
            setIsFlagged(result.is_misogynistic);

            // Determine severity based on scores, not just the boolean flag
            // This logic should align with or be independent of the backend's is_misogynistic logic
            // You could use the HIGHER score to determine severity
            const maxScore = Math.max(result.score_toxic, result.score_insult);
            if (maxScore > 0.8) setSeverity('high'); // Define your severity thresholds here
            else if (maxScore > 0.5) setSeverity('medium'); // Example threshold for medium
            else if (maxScore > 0.3) setSeverity('low');    // Example threshold for low
            else setSeverity('none'); // Below all thresholds

            // Set feedback message based on the *severity* or the *isFlagged* boolean from backend
             if (result.is_misogynistic) { // Use the backend's decision for the main flag
                 let message = "This text contains potentially harmful language.";
                 // Add info about which score was highest if desired
                 if (result.score_toxic > result.score_insult && result.score_toxic > (result.score_insult + 0.1)) {
                      message += ` High Toxicity detected.`;
                 } else if (result.score_insult > result.score_toxic && result.score_insult > (result.score_toxic + 0.1)) {
                      message += ` High Insult detected.`;
                 }
                 setFeedback(message);

                 // Generate suggestions if content is flagged by the backend
                 const newSuggestions = generateSuggestions(text, result.score_toxic, result.score_insult);
                 setSuggestions(newSuggestions);
                 // setShowSuggestions(newSuggestions.length > 0); // Optional: auto-open suggestions if any
                 setShowStatistics(true); // Show statistics when content is flagged
             } else {
                 setFeedback("Text appears to be inclusive and respectful.");
                 setSuggestions([]); // Clear suggestions for non-flagged text
                 // setShowSuggestions(false); // Hide suggestions for non-flagged text
                 setShowStatistics(false); // Hide statistics for non-flagged text
             }

             if (result.error) {
                 console.error("Backend reported error:", result.error);
                 // Maybe update feedback to include backend error?
                 setFeedback(`Backend message: ${result.error}`); // Overwrite previous feedback
             }

        } catch (error) {
            console.error("Error checking text:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setFeedback(`Connection error: ${errorMessage}`); // Show connection/fetch errors
            setIsFlagged(false); // Ensure flag is off on error
            setSeverity('none'); // Ensure severity is none on error
        } finally {
            setIsAnalyzing(false); // End loading state
        }
    };

    // useEffect hook for debounced analysis - Logic stays in parent
    useEffect(() => {
        // Clear analysis results and states when input becomes empty
        if (inputText.trim() === "") {
            setIsFlagged(false);
            setFeedback("");
            setSeverity('none');
            setSuggestions([]);
            // setShowSuggestions(false); // Manage this state internally in SuggestionsPanel
            setShowStatistics(false);
            setIsAnalyzing(false); // Ensure analyzing is false when empty
            return;
        }

        // Set the analyzing state when input changes and is not empty
        setIsAnalyzing(true);
        // Clear previous timeout before setting a new one
        const handler: NodeJS.Timeout = setTimeout(() => {
            // Call the API function after the debounce delay
            checkTextWithApi(inputText);
        }, DEBOUNCE_DELAY);

        // Cleanup function: clear the timeout
        return () => {
            clearTimeout(handler);
        };

    }, [inputText]); // Effect re-runs when inputText changes

    // Handler for direct text input (contenteditable div) - Logic stays in parent
    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        // Use event.currentTarget instead of event.target for contenteditable
        // Ensure ref is also valid
        if (textInputRef.current && event.currentTarget === textInputRef.current) {
             // Check if textContent is available and not null/undefined
            const currentText = event.currentTarget.textContent ?? '';
            setInputText(currentText);
        }
    };

    // Apply a suggestion - Logic stays in parent as it modifies inputText state and ref
    const applySuggestion = (original: string, suggested: string) => {
        if (textInputRef.current && textInputRef.current.textContent !== null) {
            // Replace the problematic term globally (case-insensitive)
            const regex = new RegExp(`\\b${original}\\b`, 'gi');
            const newText = textInputRef.current.textContent.replace(regex, suggested);

            // Update the contenteditable div and state
            textInputRef.current.textContent = newText;
            setInputText(newText); // Trigger re-analysis via useEffect
        }
    };

     // Get color scheme based on severity - Logic stays in parent or could be a utility function
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
            default: // severity === 'none'
                return {
                    border: 'border-green-400',
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    icon: <Check className="w-5 h-5 text-green-600" />,
                };
        }
    };

    const colors = getSeverityColors(); // Get colors based on current severity state

    // --- Clear the input area ---
    const handleClear = () => {
        if (textInputRef.current) {
            textInputRef.current.textContent = ''; // Clear the div content
            setInputText(''); // Clear the state (triggers useEffect cleanup)
            // Reset all analysis-related states
            setIsFlagged(false);
            setFeedback('');
            setSeverity('none');
            setSuggestions([]);
            // setShowSuggestions(false); // SuggestionsPanel manages its own toggle now
            setShowStatistics(false);
            setIsAnalyzing(false); // Ensure analyzing is false
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
                    {/* Only render FeedbackPanel if there's feedback OR if input is not empty (covers analyzing state) */}
                    {(feedback || inputText.trim() !== '' || isAnalyzing) && (
                        <FeedbackPanel
                            feedback={feedback}
                            isFlagged={isFlagged}
                            severity={severity}
                            toxicScore={toxicScore}
                            insultScore={insultScore}
                            suggestions={suggestions}
                            applySuggestion={applySuggestion} // Pass apply function down
                            showStatistics={showStatistics} // Pass stats state
                            setShowStatistics={setShowStatistics} // Pass stats setState
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