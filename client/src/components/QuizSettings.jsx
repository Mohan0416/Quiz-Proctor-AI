export function QuizSettings({ settings, setSettings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <input
        type="number"
        placeholder="No. of Questions"
        value={settings.numberOfQuestions}
        onChange={(e) => setSettings({ ...settings, numberOfQuestions: e.target.value })}
        className="border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 transition"
      />

      <select
        value={settings.difficulty}
        onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}
        className="border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 transition"
      >
        <option value="">Select Difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input
        type="text"
        placeholder="Topic / Tag"
        value={settings.topic}
        onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
        className="border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>
  );
}
