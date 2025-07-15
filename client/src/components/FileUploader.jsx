export function FileUploader({ onFileSelect }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file); // ✅ Corrected function name
    }
  };

  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">Upload PDF</label>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="w-full border px-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
