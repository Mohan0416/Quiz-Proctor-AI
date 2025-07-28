import { Link } from 'react-router-dom';

export default function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-white text-center p-4">
      <h1 className="text-4xl font-bold text-green-700 mb-4">🎉 Thank You for Your Participation!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Your responses have been recorded. Results will be mailed to you soon.
      </p>
    </div>
  );
}
