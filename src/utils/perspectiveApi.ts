// This is a utility to interact with the Perspective API
// You'll need to get an API key from: https://developers.perspectiveapi.com/

export interface AnalysisResult {
  toxicity: number
  identity_attack: number
  insult: number
  threat: number
  sexually_explicit: number
  severe_toxicity: number
  profanity: number
}

export interface AnalysisResponse {
  attributeScores: {
    TOXICITY: { summaryScore: { value: number } }
    IDENTITY_ATTACK: { summaryScore: { value: number } }
    INSULT: { summaryScore: { value: number } }
    THREAT: { summaryScore: { value: number } }
    SEXUALLY_EXPLICIT: { summaryScore: { value: number } }
    SEVERE_TOXICITY: { summaryScore: { value: number } }
    PROFANITY: { summaryScore: { value: number } }
  }
}

// For demo purposes, we'll use a mock function that simulates API responses
// In production, replace this with actual API calls
export async function analyzeText(text: string): Promise<AnalysisResult> {
  try {
    const API_KEY = process.env.API_KEY
    const response = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text },
        languages: ["en"],
        requestedAttributes: {
          TOXICITY: {},
          IDENTITY_ATTACK: {},
          INSULT: {},
          THREAT: {},
          SEXUALLY_EXPLICIT: {},
          SEVERE_TOXICITY: {},
          PROFANITY: {},
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Perspective API error:", errorData)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = (await response.json()) as AnalysisResponse

    return {
      toxicity: data.attributeScores.TOXICITY?.summaryScore.value || 0,
      identity_attack: data.attributeScores.IDENTITY_ATTACK?.summaryScore.value || 0,
      insult: data.attributeScores.INSULT?.summaryScore.value || 0,
      threat: data.attributeScores.THREAT?.summaryScore.value || 0,
      sexually_explicit: data.attributeScores.SEXUALLY_EXPLICIT?.summaryScore.value || 0,
      severe_toxicity: data.attributeScores.SEVERE_TOXICITY?.summaryScore.value || 0,
      profanity: data.attributeScores.PROFANITY?.summaryScore.value || 0,
    }
  } catch (error) {
    console.error("Error analyzing text:", error)
    // Fallback to a safe default if the API call fails
    return {
      toxicity: 0,
      identity_attack: 0,
      insult: 0,
      threat: 0,
      sexually_explicit: 0,
      severe_toxicity: 0,
      profanity: 0,
    }
  }
}

// Function to determine if text is potentially misogynistic
export function isMisogynistic(result: AnalysisResult): boolean {
  // Consider text misogynistic if any of these scores are high
  return result.toxicity > 0.7 || result.identity_attack > 0.7 || result.insult > 0.8 || result.severe_toxicity > 0.6
}

// Function to get feedback based on analysis
export function getFeedback(result: AnalysisResult): string {
  if (isMisogynistic(result)) {
    if (result.identity_attack > 0.7) {
      return "This content contains language that may be targeting individuals based on their identity. Consider revising to be more respectful."
    } else if (result.insult > 0.8) {
      return "This content contains insulting language that could be harmful. Consider using more constructive and respectful language."
    } else if (result.severe_toxicity > 0.6) {
      return "This content contains severely toxic language. Please revise to maintain a respectful conversation."
    } else {
      return "This content may contain harmful language. Consider revising to be more inclusive and respectful."
    }
  }
  return "No significant issues detected in this content."
}



