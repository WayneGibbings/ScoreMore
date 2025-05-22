import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <p className="text-sm text-gray-500 mb-4">Last Updated: May 22, 2025</p>

            <h3 className="text-lg font-semibold mb-2">Introduction</h3>
            <p className="mb-4">
              Welcome to HockeyScorer ("we," "our," or "us"). We respect your privacy and are
              committed to protecting your personal data. This privacy policy will inform you about
              how we handle your personal data when you visit our website and app (regardless of
              where you visit it from) and tell you about your privacy rights.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">The Data We Collect</h3>
            <p className="mb-4">
              HockeyScorer uses local browser storage to save your game data directly on your
              device. This data includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Team names and colors</li>
              <li>Player names and scores</li>
              <li>Game history and results</li>
              <li>Notes and comments you've added during games</li>
            </ul>
            <p className="mb-4">
              <strong>Important:</strong> This data remains on your device and is not transmitted to
              our servers. We cannot access this information.
            </p>
          </section>{' '}
          <section>
            <h3 className="text-lg font-semibold mb-2">Local Storage</h3>
            <p className="mb-4">
              Our app uses browser local storage, not cookies, to save your data and preferences.
              This local storage data stays on your device and is not transmitted to any servers.
              Unlike cookies, local storage data is not sent with HTTP requests.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
            <p className="mb-4">
              Since your data is stored locally on your device, you have complete control over it.
              You can:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Clear your browser's local storage to remove all saved data</li>
              <li>Delete individual games from your game history</li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Changes to This Privacy Policy</h3>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:feedback@hockeyscorer.app" className="text-blue-600 hover:underline">
                feedback@hockeyscorer.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
