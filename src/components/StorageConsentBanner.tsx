import React, { useState, useEffect } from 'react';

interface StorageConsentBannerProps {
  onAccept: () => void;
}

export const StorageConsentBanner: React.FC<StorageConsentBannerProps> = ({ onAccept }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted local storage use
    const hasAccepted = localStorage.getItem('storageConsent') === 'true';
    if (!hasAccepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('storageConsent', 'true');
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
          This application stores data locally on your device to save your game information and
          settings. No data is sent to our servers. By continuing to use this site, you consent to
          local data storage in accordance with our Privacy Policy.
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
