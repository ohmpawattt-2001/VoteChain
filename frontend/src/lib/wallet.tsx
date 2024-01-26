import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { http } from 'viem';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'VoteChain',
  projectId: 'WALLETCONNECT_PROJECT_ID',
  chains: [mainnet, polygon, arbitrum, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
  },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export function WalletConnectBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 12 }}>
      <ConnectButton />
    </div>
  );
}
