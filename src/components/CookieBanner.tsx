import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
  onAccept: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onAccept }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent') === 'true';
    if (!hasAccepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
    if (onAccept) onAccept();
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-40">
      <div className="max-w-4xl mx-auto">
        <p className="mb-2">
          This website uses cookies to enhance your experience. By continuing to use this site, you
          consent to our use of cookies in accordance with our Privacy Policy.
        </p>
        <div className="flex justify-end space-x-4 mt-2">
          <button
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
