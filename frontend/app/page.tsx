'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { AlertTriangle, Check, AlertCircle } from 'lucide-react';

import InfoPanel from '../components/InfoPanel';
import InputArea from '../components/InputArea';
import FeedbackPanel from '../components/FeedbackPanel';
import ActionFooter from '../components/ActionFooter';

const API_URL = 'http://localhost:5000/detect';
const DEBOUNCE_DELAY = 500;

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

export default function HomePage() {
    const [inputText, setInputText] = useState<string>('');
    const [isFlagged, setIsFlagged] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'none'>('none');
    const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showStatistics, setShowStatistics] = useState<boolean>(false);
    const [flaggedCount, setFlaggedCount] = useState<number>(0);

    const [misogynyScore, setMisogynyScore] = useState<number>(0);

    const [misogynisticStatisticsData, setMisogynisticStatisticsData] = useState<StatisticItem[]>([]);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    const textInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            const API_URL_STATISTICS = 'http://localhost:5000/statistics';
            try {
                const response = await fetch(API_URL_STATISTICS);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: StatisticItem[] = await response.json();
                setMisogynisticStatisticsData(data);
                setStatsLoading(false);
            } catch (error) {
                console.error("Error fetching statistics:", error);
                setStatsError(`Failed to load statistics: ${String(error)}`);
                setStatsLoading(false);
            }
        };

        fetchStatistics();

    }, []);

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

        if (generated.length === 0 && isFlagged) {
             generated.push({
                original: "overall tone",
                suggested: "more neutral language",
                reason: "The current phrasing may come across as hostile or disrespectful"
            });
        }

        return generated;
    };

    const checkTextWithApi = async (text: string) => {
        setIsAnalyzing(true);
         setIsFlagged(false);
         setSeverity('none');
         setSuggestions([]);
         setShowStatistics(false);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let errorMsg = `HTTP error! status: ${response.status}`;
                 if (errorBody) errorMsg += `. Body: ${errorBody}`;
                throw new Error(errorMsg);
            }

            const result: DetectionResult = await response.json();
            console.log("Detection Result:", result);

            const currentMisogynyScore = result.score_misogyny ?? 0;
            setMisogynyScore(currentMisogynyScore);
            setIsFlagged(result.is_misogynistic);

            if (currentMisogynyScore > 0.8) setSeverity('high');
            else if (currentMisogynyScore > 0.5) setSeverity('medium');
            else if (currentMisogynyScore > 0.2) setSeverity('low');
            else setSeverity('none');

             if (result.is_misogynistic) {
                 setFlaggedCount(prevCount => prevCount + 1);

                 let message = "This text contains potentially harmful language.";
                 if (result.rule_applied) {
                     message += ` (Identified by rule: ${result.rule_applied})`;
                 }
                 setFeedback(message);

                 const newSuggestions = generateSuggestions(text, currentMisogynyScore);
                 setSuggestions(newSuggestions);
                 setShowStatistics(true);
             } else {
                 setFeedback("Text appears to be inclusive and respectful.");
                 setSuggestions([]);
                 setShowStatistics(false);
             }

             if (result.error) {
                 console.error("Backend reported error:", result.error);
                 setFeedback(`Backend message: ${result.error}`);
             }

        } catch (error) {
            console.error("Error checking text:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setFeedback(`Connection error: ${errorMessage}`);
            setIsFlagged(false);
            setSeverity('none');
            setMisogynyScore(0);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (inputText.trim() === "") {
            setIsFlagged(false);
            setFeedback("");
            setSeverity('none');
            setSuggestions([]);
            setShowStatistics(false);
            setIsAnalyzing(false);
            setMisogynyScore(0);
            return;
        }

        setIsAnalyzing(true);
        const handler: NodeJS.Timeout = setTimeout(() => {
            checkTextWithApi(inputText);
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(handler);
        };

    }, [inputText]);

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        if (textInputRef.current && event.currentTarget === textInputRef.current) {
            const currentText = event.currentTarget.textContent ?? '';
            setInputText(currentText);
        }
    };

    const applySuggestion = (original: string, suggested: string) => {
        if (textInputRef.current && textInputRef.current.textContent !== null) {
            const regex = new RegExp(`\\b${original}\\b`, 'gi');
            const newText = textInputRef.current.textContent.replace(regex, suggested);
            textInputRef.current.textContent = newText;
            setInputText(newText);
        }
    };

     const getSeverityColors = () => {
        switch (severity) {
            case 'high': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
            case 'medium': return { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-700', icon: <AlertCircle className="w-5 h-5 text-orange-500" /> };
            case 'low': return { border: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <AlertCircle className="w-5 h-5 text-yellow-500" /> };
            default: return { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', icon: <Check className="w-5 h-5 text-green-600" /> };
        }
    };
    const colors = getSeverityColors();

    const handleClear = () => {
        if (textInputRef.current) {
            textInputRef.textContent = '';
            setInputText('');
            setIsFlagged(false);
            setFeedback('');
            setSeverity('none');
            setSuggestions([]);
            setShowStatistics(false);
            setIsAnalyzing(false);
            setMisogynyScore(0);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-800 mb-2">ShieldHER</h1>
                    <p className="text-lg text-gray-600">Detect and prevent online misogyny in real-time</p>
                </header>

                <main className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <InfoPanel
                        showInfoPanel={showInfoPanel}
                        setShowInfoPanel={setShowInfoPanel}
                    />

                    <InputArea
                        textInputRef={textInputRef}
                        inputText={inputText}
                        handleInput={handleInput}
                        handleClear={handleClear}
                        isAnalyzing={isAnalyzing}
                        isFlagged={isFlagged}
                        colors={colors}
                    />

                    {(feedback || inputText.trim() !== '' || isAnalyzing) && (
                        <FeedbackPanel
                            feedback={feedback}
                            isFlagged={isFlagged}
                            severity={severity}
                            misogynyScore={misogynyScore}
                            suggestions={suggestions}
                            applySuggestion={applySuggestion}
                            showStatistics={showStatistics}
                            setShowStatistics={setShowStatistics}
                            flaggedCount={flaggedCount}
                            misogynisticStatisticsData={misogynisticStatisticsData}
                            statsLoading={statsLoading}
                            statsError={statsError}
                        />
                    )}

                    <ActionFooter
                        inputText={inputText}
                        isAnalyzing={isAnalyzing}
                        checkTextWithApi={checkTextWithApi}
                    />
                </main>

                <div className="mt-8 text-center text-gray-600 text-sm">
                    <p>A hackathon project for gender equality & inclusive online spaces</p>
                </div>
            </div>
        </div>
    );
}