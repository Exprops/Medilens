// import React from "react";

// const Home = () => {
//     return (
//         <div>
//             <h1>About Medilens</h1>
//         </div>
//     )
    
// }

// export default About

import React from 'react';

// function About() 
const About = () => {
  return (
    <div className="about-container max-w-3xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-4xl font-bold mb-6 text-center">About MediLens</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          MediLens is dedicated to empowering individuals by providing AI-powered medical insights quickly and accurately.
          Upload an image of your condition or describe your symptoms, and our system analyzes it to provide helpful information,
          first aid suggestions, and nearby hospital locations.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed">
          <li>Image and text analysis powered by state-of-the-art AI.</li>
          <li>Instant first aid and mitigation steps for common injuries and conditions.</li>
          <li>Interactive map showing nearby hospitals and medical facilities.</li>
          <li>User-friendly interface designed for quick and easy access.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Ready to try it out? Head over to the <strong>HomePage</strong> to start your analysis.
          Our AI assistant is here to help guide you with instant insights.
        </p>
        <p className="text-gray-700 leading-relaxed italic">
          <strong>Disclaimer:</strong> MediLens is not a substitute for professional medical advice.
          Always consult a healthcare professional for any serious or persistent medical concerns.
        </p>
      </section>
    </div>
  )
}

export default About;
