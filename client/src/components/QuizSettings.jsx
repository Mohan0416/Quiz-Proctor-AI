import { useState, useEffect } from "react";

export function QuizSettings({ onSettingsChange }) {
  const [settings, setSettings] = useState({
    numberOfQuestions: "",
    difficulty: "easy",
    topic: ""
  });

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings]);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium text-gray-700 mb-1">Number of Questions</label>
        <input
          type="number"
          name="numberOfQuestions"
          value={settings.numberOfQuestions}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Difficulty</label>
        <select
          name="difficulty"
          value={settings.difficulty}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Topic (optional)</label>
        <input
          type="text"
          name="topic"
          value={settings.topic}
          onChange={handleChange}
          placeholder="e.g., Physics"
          className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
