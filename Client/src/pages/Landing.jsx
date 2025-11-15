export default function Landing({ setPage }) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-center p-8">
        <h1 className="text-5xl font-bold mb-4">RapidQuest AI Workspace</h1>
        <p className="text-gray-600 text-lg max-w-xl">
          Smart file management for marketing teams — powered by Gemini AI.
        </p>
  
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setPage("login")}
            className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Login
          </button>
  
          <button
            onClick={() => setPage("register")}
            className="px-6 py-3 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }
  