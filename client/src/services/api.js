import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true  // sends session cookies from Flask
});

export const generateQuiz = async ({ file, numQuestions, difficulty, topic }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("questions", numQuestions);
  formData.append("difficulty", difficulty);
  formData.append("topic", topic);

  const res = await API.post("/generate", formData);
  return res.data;
};

export const createGoogleForm = async ({ title, questions }) => {
  const res = await API.post("/create-form", { title, questions });
  return res.data;
};

export const getProctorLink = async ({ formUrl }) => {
  const res = await API.post("/get-proctor-link", { form_url: formUrl });
  return res.data.proctor_link;
};

export const sendResult = async ({ email, score, name }) => {
  const res = await API.post("/send-result", { email, score, name });
  return res.data;
};
