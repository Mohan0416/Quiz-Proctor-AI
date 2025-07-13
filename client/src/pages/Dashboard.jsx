import { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { QuizSettings } from '../components/QuizSettings';
import  {GenerateButton}  from '../components/GenerateButton';
import { ToastWrapper } from '../components/Toast';

export default function Dashboard() {
  const [fileData, setFileData] = useState(null);
  const [settings, setSettings] = useState({
    numberOfQuestions: '',
    difficulty: '',
    topic: ''
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-inter">
      <div className="max-w-3xl mx-auto mt-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 px-10 border border-slate-200">
        <h1 className="text-4xl font-bold text-center text-slate-800 flex items-center justify-center gap-2 mb-8">
          📘 <span>AI Quiz Generator</span>
        </h1>

        <FileUploader onUpload={setFileData} />
        <QuizSettings settings={settings} setSettings={setSettings} />
        <GenerateButton fileData={fileData} settings={settings} />
      </div>
      <ToastWrapper />
    </div>
  );
}
