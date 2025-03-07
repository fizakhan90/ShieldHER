import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/24/outline"
import "./globals.css"


export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-indigo-800 dark:text-indigo-300 mb-6">MisogynyCheck</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          A powerful tool to detect and prevent misogynistic content in digital communications. Analyze text or use our
          keyboard prevention feature to stop harmful content before it's sent.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">Content Analyzer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Analyze any text for misogynistic content. Get detailed insights and scores to understand the nature of
              the content.
            </p>
            <Link
              href="/analyzer"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Analyzer
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">Keyboard Prevention</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Real-time prevention of misogynistic content as you type. Get instant feedback and suggestions for
              improvement.
            </p>
            <Link
              href="/keyboard"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Keyboard
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">Why Use MisogynyCheck?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">Accurate Detection</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Powered by advanced AI to accurately identify subtle forms of misogynistic content.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">Real-time Prevention</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stop harmful content before it's sent with our keyboard prevention feature.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">Detailed Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get comprehensive insights into the nature and severity of detected content.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

