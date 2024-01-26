import React from 'react';
import { WalletProvider, WalletConnectBar } from '../lib/wallet';

export function Home() {
  return (
    <WalletProvider>
      <WalletConnectBar />
      <main style={{ padding: 24 }}>
        <h2>Create and vote on-chain</h2>
        <ul>
          <li>Single or multiple choice options</li>
          <li>Whitelist or public voting</li>
          <li>Anonymous voting (planned)</li>
        </ul>
      </main>
    </WalletProvider>
  );
}
