import { Toast } from './Toast';
import { generateQuiz } from '../services/api';
import { FaRocket } from 'react-icons/fa';

export function GenerateButton({ fileData, settings }) {
  const handleClick = async () => {
    if (!fileData || !settings.numberOfQuestions || !settings.difficulty) {
      Toast.error("Please complete all fields.");
      return;
    }

    try {
      Toast.info("Generating quiz...");
      const res = await generateQuiz(fileData, settings);

      if (res?.link) {
        navigator.clipboard.writeText(res.link);
        Toast.success("✅ Link copied to clipboard!");
      } else {
        Toast.error("Failed to generate quiz.");
      }
    } catch (err) {
      Toast.error("Error generating quiz.");
    }
  };

  return (
    <div className="text-center mt-6">
      <button
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md text-lg font-medium transition-all flex items-center justify-center gap-2 mx-auto"
      >
        <FaRocket />
        Generate Proctored Link
      </button>
    </div>
  );
}
