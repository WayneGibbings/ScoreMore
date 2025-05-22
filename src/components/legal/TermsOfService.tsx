import React from 'react';
import { X } from 'lucide-react';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Terms of Service</h2>
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

            <h3 className="text-lg font-semibold mb-2">Agreement to Terms</h3>
            <p className="mb-4">
              By accessing or using the HockeyScorer app, you agree to be bound by these Terms of
              Service. If you disagree with any part of these terms, you may not access the app.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Description of Service</h3>
            <p className="mb-4">
              HockeyScorer is an application designed to help users keep track of scores during
              field hockey games. It allows users to create teams, add players, track individual
              scores, and maintain game history.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Intellectual Property Rights</h3>
            <p className="mb-4">
              Unless otherwise stated, HockeyScorer and/or its licensors own the intellectual
              property rights for all material on the app. All intellectual property rights are
              reserved.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Restrictions</h3>
            <p className="mb-4">You are specifically restricted from:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Copying, modifying, or creating derivative works of the application</li>
              <li>
                Attempting to decompile or reverse engineer any software contained on HockeyScorer
              </li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Using the application in any way that could damage or overburden the system</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">No Warranties</h3>
            <p className="mb-4">
              HockeyScorer is provided "as is," with all faults, and makes no express or implied
              representations or warranties. We do not warrant that the app will be uninterrupted or
              error-free.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Limitation of Liability</h3>
            <p className="mb-4">
              In no event shall HockeyScorer or its suppliers be liable for any damages arising out
              of the use or inability to use the application, even if we have been notified of the
              possibility of such damages.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Changes to Terms</h3>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any
              changes by updating the "Last Updated" date of these Terms of Service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
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
