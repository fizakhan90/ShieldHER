import ContentAnalyzer from "@/components/ContentAnalyzer"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Content Analyzer - MisogynyCheck",
  description: "Analyze text for misogynistic content and get detailed insights",
}

export default function AnalyzerPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-indigo-800 dark:text-indigo-300 mb-8">Content Analyzer</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Paste any text below to analyze it for misogynistic content. Our AI will provide a detailed breakdown of the
          content.
        </p>
        <ContentAnalyzer />
      </div>
    </>
  )
}

