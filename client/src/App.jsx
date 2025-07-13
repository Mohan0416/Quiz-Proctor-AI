import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProctorPage from './pages/ProctorPage';
import ThankYou from './pages/ThankYou';
import { ToastWrapper } from './components/Toast';
//import { Header } from './components/Header';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/test/:quizId" element={<ProctorPage />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
      <ToastWrapper />
    </>
  );
}

export default App;
