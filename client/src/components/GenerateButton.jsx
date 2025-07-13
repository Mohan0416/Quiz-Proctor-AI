import { Toast } from './Toast';
import { FaRocket } from 'react-icons/fa';

export function GenerateButton({ fileData, settings }) {
  const handleClick = async () => {
    if (!fileData || !settings.numberOfQuestions || !settings.difficulty) {
      Toast.error("Please complete all fields.");
      return;
    }

    try {
      Toast.info("Generating quiz...");

      const formData = new FormData();
      formData.append("file", fileData);
      formData.append("questions", settings.numberOfQuestions);
      formData.append("difficulty", settings.difficulty);
      if (settings.topic) {
        formData.append("topic", settings.topic);
      }

      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result?.questions) {
        console.log("Generated questions:", result.questions);
        Toast.success("✅ Quiz generated successfully!");
      } else {
        Toast.error("Failed to generate quiz.");
      }
    } catch (err) {
      console.error("API Error:", err);
      Toast.error("Error generating quiz.");
    }
  };

  return (
    <div className="text-center mt-6">
      <button
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md text-lg font-medium transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
      >
        <FaRocket />
        Generate Proctored Link
      </button>
    </div>
  );
}
