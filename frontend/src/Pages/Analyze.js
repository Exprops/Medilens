// import React from 'react';
// import { Link } from 'react-router-dom';

// function Analyze() {
//   return (
//     <div className="text-center p-10">
//       <h1 className="text-4xl font-bold mb-4">Welcome to MediLens</h1>
//       <p className="text-gray-600 mb-6">
//         Upload your medical images and get instant analysis with AI. Get steps, nearby hospitals, and more.
//       </p>
//       <Link
//         to="/analyze"
//         className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
//       >
//         Start Analysis
//       </Link>
//     </div>
//   );
// }

// export default Analyze;

import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-white text-gray-800 font-sans">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Empowering Health with <span className="text-teal-600">AI</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-700">
          Welcome to <strong>MediLens</strong> — a smart medical assistant that uses cutting-edge AI to detect symptoms from images or text and provide instant care guidance and hospital suggestions.
        </p>
        <Link to="/analyze">
          <button className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all duration-300 hover:bg-teal-700">
            Start Diagnosis
          </button>
        </Link>
      </section>

      {/* Feature Section */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
        <FeatureCard
          icon="🧠"
          title="Smart Analysis"
          description="Upload images or text, and get instant AI-driven insights."
        />
        <FeatureCard
          icon="📍"
          title="Nearby Hospitals"
          description="Get real-time locations of hospitals closest to you."
        />
        <FeatureCard
          icon="💊"
          title="First Aid Guide"
          description="Receive step-by-step instructions for common injuries and conditions."
        />
      </section>

      {/* Call to Action */}
      <section className="text-center px-6 py-16 bg-[#f1fdfc]">
        <h2 className="text-3xl font-bold mb-4">Why Wait? Try MediLens Now</h2>
        <p className="text-gray-700 mb-6">Whether it's a minor cut or a serious concern, get help instantly.</p>
        <Link to="/analyze">
          <button className="px-8 py-3 bg-teal-500 text-white font-medium rounded-full hover:bg-teal-600 transition-all duration-300">
            Analyze My Symptoms
          </button>
        </Link>
      </section>

      {/* Disclaimer */}
      <footer className="text-sm text-center text-gray-500 py-6 px-4">
        <p>
          <strong>Disclaimer:</strong> MediLens is not a replacement for professional medical diagnosis.
          Always consult a licensed medical practitioner for emergencies.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 text-center transition duration-300">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default HomePage;
