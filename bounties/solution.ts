// src/components/WelcomeModal.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';

// ---------------------------------------------------------------------------
// Bridge placeholder – replace with real SDK / API integration as needed
// ---------------------------------------------------------------------------
export type BridgeParams = {
  token: string;
  amount: string;
  destinationChain: string;
};

export async function bridgeFunds(params: BridgeParams): Promise<void> {
  // Simulate async bridge call
  console.log('Bridging funds:', params);
  return new Promise((resolve) => setTimeout(resolve, 1500));
}

// ---------------------------------------------------------------------------
// Context to allow opening the modal from anywhere in the app
// ---------------------------------------------------------------------------
type WelcomeModalContextType = {
  open: () => void;
};

const WelcomeModalContext = createContext<WelcomeModalContextType | undefined>(undefined);

export const useWelcomeModal = (): WelcomeModalContextType => {
  const ctx = useContext(WelcomeModalContext);
  if (!ctx) {
    throw new Error('useWelcomeModal must be used within a WelcomeModalProvider');
  }
  return ctx;
};

export const WelcomeModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);

  // Show automatically on first visit
  useEffect(() => {
    const hasSeen = localStorage.getItem('welcome_modal_seen');
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('welcome_modal_seen', 'true');
  };

  const contextValue = {
    open: () => setOpen(true),
  };

  return (
    <WelcomeModalContext.Provider value={contextValue}>
      {children}
      <WelcomeModal open={open} onClose={handleClose} />
    </WelcomeModalContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Main WelcomeModal component
// ---------------------------------------------------------------------------
type WelcomeModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  // Bridge UI state
  const [token, setToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [destChain, setDestChain] = useState('Arbitrum');
  const [isBridging, setIsBridging] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleBridge = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setSnack({ open: true, message: 'Enter a valid amount.', severity: 'error' });
      return;
    }
    setIsBridging(true);
    try {
      await bridgeFunds({ token, amount, destinationChain: destChain });
      setSnack({ open: true, message: 'Bridge transaction submitted!', severity: 'success' });
      setAmount('');
    } catch (e) {
      console.error(e);
      setSnack({ open: true, message: 'Bridge failed. See console for details.', severity: 'error' });
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Welcome to CAP Trading Dashboard</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              CAP (Cross‑Asset Protocol) lets you trade assets across L2s and L1s with
              minimal friction. This dashboard provides real‑time charts, order‑book,
              and instant swaps.
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Getting Started</strong>
            </Typography>
            <ul>
              <li>Connect your wallet (MetaMask, WalletConnect, etc.).</li>
              <li>Ensure you have funds on the network you wish to trade.</li>
              <li>
                Use the bridge below to move assets between Ethereum Mainnet and
                Arbitrum (or any supported chain).
              </li>
              <li>Start trading by selecting a pair from the sidebar.</li>
            </ul>
          </Box>

          {/* Integrated Bridge UI */}
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="h6" gutterBottom>
              Quick Bridge
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="token-label">Token</InputLabel>
              <Select
                labelId="token-label"
                value={token}
                label="Token"
                onChange={(e) => setToken(e.target.value as string)}
              >
                <MenuItem value="ETH">ETH</MenuItem>
                <MenuItem value="USDC">USDC</MenuItem>
                <MenuItem value="DAI">DAI</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="dest-chain-label">Destination Chain</InputLabel>
              <Select
                labelId="dest-chain-label"
                value={destChain}
                label="Destination Chain"
                onChange={(e) => setDestChain(e.target.value as string)}
              >
                <MenuItem value="Arbitrum">Arbitrum</MenuItem>
                <MenuItem value="Ethereum">Ethereum</MenuItem>
                <MenuItem value="Optimism">Optimism</MenuItem>
              </Select>
            </FormControl>

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleBridge}
                disabled={isBridging}
              >
                {isBridging ? 'Bridging...' : 'Bridge'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};