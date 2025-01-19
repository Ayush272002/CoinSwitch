import { PublicKey, Transaction } from '@solana/web3.js';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface QuoteResponse {
  inAmount: number;
  outAmount: number;
}

export interface WalletContextState {
  publicKey: PublicKey | null;
  signTransaction:
    | ((transaction: Transaction) => Promise<Transaction>)
    | undefined;
  connected: boolean;
}
