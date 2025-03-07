import KeyboardPrevention from "@/components/KeyboardPrevention"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Keyboard Prevention - MisogynyCheck",
  description: "Real-time prevention of misogynistic content as you type",
}

export default function KeyboardPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-indigo-800 dark:text-indigo-300 mb-8">
          Keyboard Prevention
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Type in the text area below to test our real-time misogyny detection. The system will alert you if potentially
          harmful content is detected.
        </p>
        <KeyboardPrevention />
      </div>
    </>
  )
}

