export default function Loading() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Loading MisogynyCheck</h2>
          <p className="mt-2 text-gray-600">Please wait while we load the toxicity detection model...</p>
        </div>
      </div>
    );
  }