import React, { useState } from 'react';
import { Modal, Button, Tabs, Tab } from 'react-bootstrap';
import './WelcomeModal.css';

const WelcomeModal = ({ show, onHide }) => {
  const [key, setKey] = useState('welcome');

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Welcome to CAP Trading Dashboard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id="welcome-modal-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
        >
          <Tab eventKey="welcome" title="Welcome">
            <div className="tab-content">
              <h5>What is CAP?</h5>
              <p>CAP is a decentralized trading protocol that allows users to trade assets with low fees and high efficiency.</p>
              
              <h5>Getting Started</h5>
              <ul>
                <li>Connect your wallet using the button in the top right</li>
                <li>Bridge funds from Arbitrum using the Bridge tab</li>
                <li>Start trading using the trading dashboard</li>
              </ul>
            </div>
          </Tab>
          
          <Tab eventKey="bridge" title="Bridge Funds">
            <div className="tab-content">
              <h5>Bridge Funds from Arbitrum</h5>
              <p>To start trading, you'll need to bridge your funds from Arbitrum to CAP.</p>
              
              <div className="bridge-steps">
                <div className="step">
                  <h6>Step 1: Connect Wallet</h6>
                  <p>Make sure your wallet is connected to the Arbitrum network.</p>
                </div>
                <div className="step">
                  <h6>Step 2: Select Assets</h6>
                  <p>Choose which assets you want to bridge to CAP.</p>
                </div>
                <div className="step">
                  <h6>Step 3: Confirm Transaction</h6>
                  <p>Confirm the bridge transaction in your wallet.</p>
                </div>
                <div className="step">
                  <h6>Step 4: Wait for Confirmation</h6>
                  <p>Wait for the bridge to complete (usually 1-5 minutes).</p>
                </div>
              </div>
              
              <Button variant="primary" className="mt-3">
                Open Bridge Interface
              </Button>
            </div>
          </Tab>
          
          <Tab eventKey="instructions" title="Instructions">
            <div className="tab-content">
              <h5>Using the Trading Dashboard</h5>
              
              <div className="instruction-section">
                <h6>1. Market Selection</h6>
                <p>Choose which trading pair you want to trade from the market selector dropdown.</p>
              </div>
              
              <div className="instruction-section">
                <h6>2. Order Placement</h6>
                <p>Enter your order details in the order form on the left panel. You can place market orders, limit orders, and stop orders.</p>
              </div>
              
              <div className="instruction-section">
                <h6>3. Order Book</h6>
                <p>View the current buy and sell orders in the order book in the center of the screen.</p>
              </div>
              
              <div className="instruction-section">
                <h6>4. Trade History</h6>
                <p>See your recent trades and order history in the right panel.</p>
              </div>
              
              <div className="instruction-section">
                <h6>5. Portfolio</h6>
                <p>Check your current holdings and account balances at the bottom of the screen.</p>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;