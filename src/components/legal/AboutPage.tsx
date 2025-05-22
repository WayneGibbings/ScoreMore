import React from 'react';
import { X } from 'lucide-react';

interface AboutPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">About HockeyScorer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="flex justify-center mb-6">
            <div className="text-4xl">🏑</div>
          </section>

          <section>
            <p className="mb-4">
              HockeyScorer was created because I couldn't find anything simple and free to score my
              daughter's hockey games.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>
                <strong>Team Management:</strong> Create and name up to two teams with custom
                colors.
              </li>
              <li>
                <strong>Player Management:</strong> Add players to each team with active/inactive
                status control.
              </li>
              <li>
                <strong>Score Tracking:</strong> Increment or decrement player scores with ease.
              </li>
              <li>
                <strong>Game State:</strong> Start, end, and manage halftime for games.
              </li>
              <li>
                <strong>History:</strong> View and manage past games with detailed statistics.
              </li>
              <li>
                <strong>Notes:</strong> Add and edit notes during games to record important events.
              </li>
              <li>
                <strong>Offline Support:</strong> Works without an internet connection using local
                storage.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Technology</h3>
            <p className="mb-4">
              HockeyScorer is built using modern web technologies including React, TypeScript, and
              Tailwind CSS. All data is stored locally on your device using browser storage
              capabilities, ensuring your information remains private and accessible even without an
              internet connection.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <p className="mb-4">
              I'm always looking to improve HockeyScorer and welcome your feedback. If you have
              suggestions, questions, or concerns, please reach out:
            </p>
            <p>
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
