import { Toast } from './Toast';
import { FaRocket, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

export function GenerateButton({ fileData, settings }) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (!fileData || !settings.numberOfQuestions || !settings.difficulty) {
      Toast.error("Please complete all fields.");
      return;
    }

    setIsGenerating(true);

    try {
      Toast.info("Generating quiz...");

      const formData = new FormData();
      formData.append("file", fileData);
      formData.append("questions", settings.numberOfQuestions);
      formData.append("difficulty", settings.difficulty);
      if (settings.topic) formData.append("topic", settings.topic);

      // ✅ Generate quiz from backend
      const generateRes = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        body: formData,
        credentials: "include", // ensure session is included
      });

      if (!generateRes.ok) throw new Error(`Quiz generation failed: ${generateRes.status}`);

      const { questions } = await generateRes.json();

      let parsedQuestions;
      const bracketIndex = questions.indexOf("[");
      if (bracketIndex !== -1) {
        const jsonPart = questions.slice(bracketIndex);
        parsedQuestions = JSON.parse(jsonPart);
      } else {
        throw new Error("Invalid quiz format: no JSON array found.");
      }

      // ✅ Create Google Form
      const formRes = await fetch("http://localhost:5000/api/create-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: settings.topic || "Generated Quiz",
          questions: parsedQuestions,
        }),
      });

      const formdata = await formRes.json();
      if (!formRes.ok || !formdata.formId) {
        console.error("Google Form API Error:", formdata);
        Toast.error("❌ Failed to create Google Form.");
        return;
      }

      Toast.success("✅ Google Form created!");
      navigate(`/test/${formdata.formId}`); // redirect to proctoring page with formId
    } catch (err) {
      console.error("API Error:", err);
      Toast.error("Something went wrong while generating the quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = !fileData || !settings.numberOfQuestions || !settings.difficulty || isGenerating;

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          group relative inline-flex items-center justify-center px-12 py-4 font-bold text-lg
          rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none 
          focus:ring-4 focus:ring-offset-2 shadow-2xl min-w-72
          ${isDisabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none transform-none' 
            : isGenerating
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-wait'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 focus:ring-emerald-300 hover:shadow-emerald-500/25'
          }
        `}
      >
        {!isDisabled && !isGenerating && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        )}
        
        <div className="relative flex items-center space-x-3">
          {isGenerating ? (
            <>
              <FaSpinner className="w-6 h-6 animate-spin" />
              <span>Generating Quiz...</span>
            </>
          ) : isDisabled && fileData && settings.numberOfQuestions && settings.difficulty ? (
            <>
              <FaCheckCircle className="w-6 h-6" />
              <span>Ready to Generate</span>
            </>
          ) : (
            <>
              <FaRocket className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" />
              <span>Generate Proctored Quiz</span>
            </>
          )}
        </div>

        {!isDisabled && !isGenerating && (
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
          </div>
        )}
      </button>

      {isGenerating && (
        <div className="w-72 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      )}

      <div className="text-center">
        {isGenerating ? (
          <p className="text-sm text-gray-600 animate-pulse">
            Please wait while we create your personalized quiz...
          </p>
        ) : isDisabled && (!fileData || !settings.numberOfQuestions || !settings.difficulty) ? (
          <p className="text-sm text-red-500 font-medium">
            Complete all required fields to generate your quiz
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Click to create your AI-powered proctored quiz
          </p>
        )}
      </div>
    </div>
  );
}
