import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const showSuccess = (message) => {
  toast.success(message);
};

const showError = (message) => {
  toast.error(message);
};

const showInfo = (message) => {
  toast.info(message);
};

export const Toast = {
  success: showSuccess,
  error: showError,
  info: showInfo
};

export const ToastWrapper = () => <ToastContainer position="top-right" autoClose={3000} />;
