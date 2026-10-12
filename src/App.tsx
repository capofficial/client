import React, { useState, useEffect } from 'react';
import WelcomeModal from './components/WelcomeModal'; // Assuming App.tsx is in src/ and WelcomeModal in src/components

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('cap_welcome_modal_dismissed');
    if (hasDismissed !== 'true') {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('cap_welcome_modal_dismissed', 'true');
    }
    setShowWelcomeModal(false);
  };

  return (
    <div className="App">
      {/* Your existing application layout and components go here */}
      <header className="bg-gray-900 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">CAP Trading Dashboard</h1>
        {/* Example: Connect Wallet button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded float-right -mt-8">
          Connect Wallet
        </button>
      </header>
      <main className="p-4">
        <p className="text-gray-300">This is your main trading dashboard content.</p>
        {/* Add more dashboard components here */}
      </main>

      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
    </div>
  );
}

export default App;
