export const generateQuiz = async (file, settings) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('questions', settings.numberOfQuestions);
  formData.append('difficulty', settings.difficulty);
  formData.append('topic', settings.topic);

  const response = await fetch('http://localhost:5000/api/generate', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
