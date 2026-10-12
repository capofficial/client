import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WelcomeModalProps {
  onClose: (dontShowAgain: boolean) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'howToUse' | 'bridge'>('welcome');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-gray-800 p-6 shadow-xl border border-gray-700">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-3xl font-bold text-white">Welcome to CAP!</h2>

        <div className="mb-6 flex space-x-4 border-b border-gray-700">
          <button
            className={`pb-3 text-lg font-medium ${
              activeTab === 'welcome' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'
            } transition-colors`}
            onClick={() => setActiveTab('welcome')}
          >
            About CAP
          </button>
          <button
            className={`pb-3 text-lg font-medium ${
              activeTab === 'howToUse' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'
            } transition-colors`}
            onClick={() => setActiveTab('howToUse')}
          >
            How to Use
          </button>
          <button
            className={`pb-3 text-lg font-medium ${
              activeTab === 'bridge' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'
            } transition-colors`}
            onClick={() => setActiveTab('bridge')}
          >
            Bridge Funds
          </button>
        </div>

        <div className="modal-content max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === 'welcome' && (
            <div className="text-gray-300">
              <h3 className="mb-3 text-xl font-semibold text-white">What is CAP?</h3>
              <p className="mb-4">
                CAP is a decentralized perpetuals exchange built on Arbitrum Nova, offering a robust and capital-efficient trading experience. Trade a variety of assets with leverage, deep liquidity, and low fees.
              </p>
              <p className="mb-4">
                Our goal is to provide a transparent and fair trading environment, empowering users with control over their assets and trades.
              </p>
              <p>
                Learn more about CAP by visiting our{' '}
                <a href="https://docs.cap.finance/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  documentation
                </a>
                .
              </p>
            </div>
          )}

          {activeTab === 'howToUse' && (
            <div className="text-gray-300">
              <h3 className="mb-3 text-xl font-semibold text-white">Getting Started with the Dashboard</h3>
              <ul className="mb-4 list-disc pl-5 space-y-2">
                <li>
                  <strong>Connect Wallet:</strong> Click the "Connect Wallet" button in the top right corner to link your Web3 wallet (e.g., MetaMask).
                </li>
                <li>
                  <strong>Fund Your Account:</strong> Deposit funds into your CAP account. You'll need USDC on Arbitrum Nova. If your funds are on Arbitrum One, use the "Bridge Funds" tab or a third-party bridge.
                </li>
                <li>
                  <strong>Select Asset:</strong> Choose the cryptocurrency you wish to trade from the asset dropdown.
                </li>
                <li>
                  <strong>Open Position:</strong> Enter your desired trade size and leverage, then click "Long" or "Short" to open a position.
                </li>
                <li>
                  <strong>Manage Positions:</strong> Monitor your open positions in the "Positions" section. You can close positions, add collateral, or adjust leverage here.
                </li>
                <li>
                  <strong>View History:</strong> Check your past trades and funding history in the respective tabs.
                </li>
              </ul>
              <p>
                For more detailed guides, refer to our{' '}
                <a href="https://docs.cap.finance/how-to-use" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  documentation
                </a>
                .
              </p>
            </div>
          )}

          {activeTab === 'bridge' && (
            <div className="text-gray-300">
              <h3 className="mb-3 text-xl font-semibold text-white">Bridge Funds to Arbitrum Nova</h3>
              <p className="mb-4">
                CAP operates on Arbitrum Nova. If your funds (e.g., USDC) are currently on Arbitrum One or another network, you'll need to bridge them to Arbitrum Nova.
              </p>
              <p className="mb-4">
                Below is an integrated bridge UI from Orbiter Finance, a popular cross-rollup bridge. You can use it to transfer funds from Arbitrum One to Arbitrum Nova.
              </p>

              <div className="mb-6 h-[400px] w-full rounded-lg overflow-hidden border border-gray-700">
                <iframe
                  src="https://www.orbiter.finance/?source=Arbitrum&dest=Arbitrum%20Nova&token=USDC"
                  title="Orbiter Finance Bridge"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowTransparency
                  className="rounded-lg"
                ></iframe>
              </div>

              <p className="mb-2">
                <strong>Important Notes:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Ensure you select Arbitrum One as the source and Arbitrum Nova as the destination.</li>
                <li>Always verify the bridge URL and be cautious of phishing sites.</li>
                <li>Transaction times and fees may vary depending on network congestion.</li>
                <li>For other bridging options, consider using the official{' '}
                  <a href="https://bridge.arbitrum.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Arbitrum Bridge
                  </a>{' '}
                  (for ETH) or other third-party bridges.
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="ml-2">Don't show this again</span>
          </label>
          <button
            onClick={handleClose}
            className="rounded-md bg-blue-600 px-6 py-2 text-lg font-semibold text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
