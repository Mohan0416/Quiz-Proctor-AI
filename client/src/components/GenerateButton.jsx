import { Toast } from './Toast';
import { FaRocket } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

export function GenerateButton({ fileData, settings }) {
  const navigate = useNavigate();

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
      if (settings.topic) formData.append("topic", settings.topic);

      const generateRes = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!generateRes.ok) throw new Error(`Quiz generation failed: ${generateRes.status}`);

      const { questions } = await generateRes.json();

      let parsedQuestions;
      const match = questions.match(/\[.*\]/s); // match JSON array
      if (match) {
        parsedQuestions = JSON.parse(match[0]);

        // ✅ Filter and validate
        parsedQuestions = parsedQuestions
          .filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2)
          .map(q => ({
            question: q.question,
            options: q.options.slice(0, 4) // limit to 4
          }));

        if (parsedQuestions.length === 0) {
          throw new Error("No valid questions found.");
        }
      } else {
        throw new Error("Invalid quiz format: JSON array not found.");
      }

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
      if (!formRes.ok || !formdata.formLink) {
        console.error("Google Form API Error:", formdata);
        Toast.error("❌ Failed to create Google Form.");
        return;
      }

      Toast.success("✅ Google Form created!");
      navigate(`/test/${formdata.formLink.split('/')[5]}`);
    } catch (err) {
      console.error("API Error:", err);
      Toast.error("Something went wrong while generating the quiz.");
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
