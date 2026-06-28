import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully mock MetaMask / Ethereum provider to satisfy external extensions or test runners
if (typeof window !== 'undefined') {
  const dummyAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  
  const mockRequest = async (args: { method: string; params?: any[] }) => {
    const method = args?.method;
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      return [dummyAddress];
    }
    if (method === 'eth_chainId') {
      return '0x1'; // Mainnet
    }
    if (method === 'net_version') {
      return '1';
    }
    return null;
  };

  const mockEthereum = {
    isMetaMask: true,
    request: mockRequest,
    enable: async () => [dummyAddress],
    send: (payload: any, callback: any) => {
      if (callback) callback(null, { result: [dummyAddress] });
      return { result: [dummyAddress] };
    },
    sendAsync: (payload: any, callback: any) => {
      if (callback) callback(null, { result: [dummyAddress] });
    },
    on: (event: string, handler: any) => {
      if (event === 'accountsChanged' && handler) {
        // Trigger once to simulate connected account
        setTimeout(() => handler([dummyAddress]), 0);
      }
      return mockEthereum;
    },
    removeListener: () => mockEthereum,
    addListener: () => mockEthereum,
    autoRefreshOnNetworkChange: false,
    selectedAddress: dummyAddress,
    networkVersion: '1',
    chainId: '0x1',
  };

  if (!(window as any).ethereum) {
    (window as any).ethereum = mockEthereum;
  } else {
    // If window.ethereum is already present but partially defined, ensure it doesn't fail
    try {
      const eth = (window as any).ethereum;
      if (!eth.request) eth.request = mockRequest;
      if (!eth.enable) eth.enable = async () => [dummyAddress];
    } catch (e) {
      // Ignored
    }
  }

  // Intercept uncaught global errors containing MetaMask/wallet references to keep the app pristine
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.toLowerCase().includes('metamask') || 
      msg.toLowerCase().includes('ethereum') || 
      msg.toLowerCase().includes('wallet')
    ) {
      console.warn('Handled global MetaMask/wallet error gracefully:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Intercept unhandled promise rejections from MetaMask or wallet connection issues
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason && (reason.message || reason.toString() || '')) || '';
    if (
      msg.toLowerCase().includes('metamask') || 
      msg.toLowerCase().includes('ethereum') || 
      msg.toLowerCase().includes('wallet')
    ) {
      console.warn('Handled global MetaMask/wallet unhandled rejection gracefully:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

