import React, { useState, useEffect } from 'react';
import './WelcomeModal.css';

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to CAP",
      content: "CAP is a decentralized trading platform that allows you to trade digital assets with low fees and high performance."
    },
    {
      title: "How to Use the Dashboard",
      content: "Navigate through the dashboard using the sidebar. You can view your positions, trading history, and portfolio performance."
    },
    {
      title: "Bridging Funds",
      content: "To deposit funds, use the integrated bridge to move assets from Arbitrum to CAP. You can access the bridge anytime from the 'Bridge' tab."
    }
  ];

  const openModal = () => {
    setIsOpen(true);
    // Load the appropriate step content
    if (localStorage.getItem('welcomeModalStep')) {
      setCurrentStep(parseInt(localStorage.getItem('welcomeModalStep')));
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem('welcomeModalStep', currentStep);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeModal();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // When the component mounts, check if the welcome modal has been shown
  useEffect(() => {
    if (!localStorage.getItem('hasShownWelcomeModal')) {
      openModal();
      localStorage.setItem('hasShownWelcomeModal', 'true');
    }
  }, []);

  return (
    <div className="welcome-modal">
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{steps[currentStep]?.title}</h2>
            <p>{steps[currentStep]?.content}</p>
            
            <div className="step-navigation">
              {currentStep > 0 && (
                <button onClick={prevStep}>Previous</button>
              )}
              {currentStep < steps.length - 1 ? (
                <button onClick={nextStep}>Next</button>
              ) : (
                <button onClick={closeModal}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeModal;