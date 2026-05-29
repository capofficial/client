import React, { useState, useEffect } from 'react';
import WelcomeModal from './components/WelcomeModal';

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedCAP');
    if (!hasVisited) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasVisitedCAP', 'true');
    }
  }, []);

  return (
    <div className="App">
      <WelcomeModal show={showWelcomeModal} onHide={() => setShowWelcomeModal(false)} />
    </div>
  );
}

export default App;