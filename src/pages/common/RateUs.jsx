import React, { useState } from 'react';

const RateUs = () => {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (star) => setStars(star);
  const handleStarHover = (star) => setHovered(star);
  const handleStarLeave = () => setHovered(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can send feedback and stars to backend
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">Rate Us</h1>
        {submitted ? (
          <div className="text-green-600 font-semibold text-center">
            Thank you for your feedback!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`text-3xl focus:outline-none ${star <= (hovered || stars) ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-300"
              rows={4}
              placeholder="Your feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RateUs;
