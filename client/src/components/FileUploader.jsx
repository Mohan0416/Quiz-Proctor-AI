import { FaPaperclip } from 'react-icons/fa';

export function FileUploader({ onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onUpload(file);
  };

  return (
    <div className="mb-6">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <FaPaperclip className="text-gray-500" />
        Upload PDF or Paste YouTube Link
      </label>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
      />
    </div>
  );
}
