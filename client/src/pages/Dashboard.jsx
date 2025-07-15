import { useEffect, useState } from "react";
import { FileUploader } from "../components/FileUploader";
import { QuizSettings } from "../components/QuizSettings";
import { GenerateButton } from "../components/GenerateButton";
import { getUser } from "../services/api";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then((res) => setUser(res.user));
  }, []);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to QuizProctorAI</h2>
          <p className="text-gray-500 mb-6">Please log in to access your dashboard</p>
          {/* ✅ direct link to backend /login route */}
          <a
            href="http://localhost:5000/api/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-all"
          >
            Login with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">AI Quiz Generator</h1>
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-lg shadow-md">
        <FileUploader onFileSelect={setFile} />
        <QuizSettings onSettingsChange={setSettings} />
        <GenerateButton fileData={file} settings={settings} />
      </div>
    </div>
  );
}
