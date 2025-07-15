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
      if (settings.topic) formData.append("topic", settings.topic);

      const generateRes = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!generateRes.ok) throw new Error(`Quiz generation failed: ${generateRes.status}`);

      const { questions } = await generateRes.json();

      let parsedQuestions;
      try {
        const bracketIndex = questions.indexOf("[");
        if (bracketIndex !== -1) {
          const jsonPart = questions.slice(bracketIndex);
          parsedQuestions = JSON.parse(jsonPart);
        } else {
          throw new Error("JSON array not found.");
        }
      } catch (err) {
        console.error("Invalid JSON format in questions:", err);
        Toast.error("Invalid quiz format. Try again.");
        return;
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

      if (!formRes.ok || !formdata.formId) {
        console.error("Google Form API Error:", formdata);
        Toast.error("❌ Failed to create Google Form.");
        return;
      }

      const formLink = `https://docs.google.com/forms/d/${formdata.formId}/viewform`;
      navigator.clipboard.writeText(formLink).catch(() => {});
      window.open(formLink, "_blank");
      Toast.success("✅ Google Form created and link copied!");
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
