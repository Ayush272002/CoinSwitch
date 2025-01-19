'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { ArrowUpDown, Settings, Github } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ToastContainer, ToastPosition, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QuoteResponse, Token, WalletContextState } from '@/types/swap';
import {
  fetchTokens,
  fetchUsdPrice,
  handleCalculateOutAmts,
} from '@/lib/swapUtils';
import TokenSelector from '@/components/TokenSelector';
import SlippageModal from '@/components/SlippageModal';
import {
  Connection,
  Message,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const Swap: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sellToken, setSellToken] = useState<Token | null>(null);
  const [buyToken, setBuyToken] = useState<Token | null>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [isSellingOpen, setIsSellingOpen] = useState(false);
  const [isBuyingOpen, setIsBuyingOpen] = useState(false);
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(
    null
  );
  const [slippage, setSlippage] = useState(1);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);
  const [buyTokenUSD, setBuyTokenUSD] = useState<number | null>(null);
  const [sellTokenUSD, setSellTokenUSD] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  const wallet = useWallet() as WalletContextState;

  useEffect(() => {
    fetchTokens().then(setTokens);
  }, []);

  useEffect(() => {
    if (sellToken) {
      checkUserBalance(sellToken);
    }
  }, [sellToken, wallet.publicKey]);

  const checkTokenBalance = async (
    walletPublicKey: PublicKey,
    sellToken: Token
  ): Promise<number> => {
    try {
      const connection = new Connection('https://api.devnet.solana.com');
      const tokenAccountAddress = await getAssociatedTokenAddress(
        new PublicKey(sellToken.address),
        walletPublicKey
      );

      const tokenAccountInfo = await getAccount(
        connection,
        tokenAccountAddress
      );

      const balanceInTokens =
        Number(tokenAccountInfo.amount) / Math.pow(10, sellToken.decimals);

      return balanceInTokens;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  };

  const checkUserBalance = async (token: Token) => {
    if (!wallet.publicKey || sellToken === null) {
      console.error('Wallet is not connected.');
      return;
    }
    const userBalance = await checkTokenBalance(wallet.publicKey, sellToken);
    console.log(userBalance);
  };

  const fetchQuoteResponse = useCallback(async () => {
    if (!sellToken || !buyToken || !sellAmount) return null;

    const parsedSellAmount = parseFloat(sellAmount);
    const slippageBps = slippage * 100;
    const apiUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${
      sellToken.address
    }&outputMint=${buyToken.address}&amount=${Math.floor(
      parsedSellAmount * Math.pow(10, sellToken.decimals)
    )}&slippageBps=${slippageBps}`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data) {
        const quoteData = response.data;
        setQuoteResponse(quoteData);

        const outputAmount = handleCalculateOutAmts(
          quoteData.outAmount,
          buyToken
        );
        setBuyAmount(outputAmount.toFixed(6));
        return quoteData;
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    }
  }, [sellToken, buyToken, sellAmount, slippage]);

  useEffect(() => {
    fetchQuoteResponse();
    if (sellToken) fetchUsdPrice(sellToken).then(setSellTokenUSD);
    if (buyToken) fetchUsdPrice(buyToken).then(setBuyTokenUSD);
  }, [fetchQuoteResponse, sellToken, buyToken]);

  const toastOptions = {
    position: 'top-right' as ToastPosition,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      background: '#2D3748',
      color: '#FFFFFF',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  };

  const handleSwap = async () => {
    if (
      !sellToken ||
      !buyToken ||
      !wallet.publicKey ||
      !wallet.signTransaction
    ) {
      toast.error(
        'Please select valid tokens and connect wallet.',
        toastOptions
      );
      return;
    }

    if (parseFloat(sellAmount) > userBalance) {
      toast.error('Insufficient balance to perform the swap.', toastOptions);
      return;
    }

    try {
      const quoteResponse = await fetchQuoteResponse();

      if (!quoteResponse) {
        toast.error('Unable to fetch quote for the swap.', toastOptions);
        return;
      }

      const {
        data: { swapTransaction },
      } = await axios.post('https://quote-api.jup.ag/v6/swap', {
        quoteResponse,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
      });

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const versionedTransaction =
        VersionedTransaction.deserialize(swapTransactionBuf);

      // Serialize the message from VersionedTransaction to a Uint8Array
      const messageBytes = versionedTransaction.message.serialize();

      // Use the serialized message to create a legacy Transaction
      const transaction = Transaction.from(messageBytes);

      const signedTransaction = await wallet.signTransaction(transaction);
      const rawTransaction = signedTransaction.serialize();

      const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
      );

      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txid,
        },
        'confirmed'
      );

      toast.success(
        `Transaction successful: https://solscan.io/tx/${txid}`,
        toastOptions
      );
    } catch (error) {
      console.error('Error during swap:', error);
      toast.error('Error signing or sending the transaction', toastOptions);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r pt-24 from-gray-900 to-gray-800 text-white flex justify-center items-center p-4">
      <ToastContainer theme="dark" />
      <div className="max-w-6xl md:w-1/2 w-full bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col md:flex-row md:justify-center md:items-center">
        <div className="w-full md:pr-8 mb-8 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">CoinSwitch</h1>
            <div className="flex items-center gap-4">
              <WalletMultiButton />
              <a
                href="https://github.com/Ayush272002/CoinSwitch"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-10 h-10 text-white hover:text-gray-300 transition-colors" />
              </a>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings
                  className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white transition-colors"
                  onClick={() => setIsSlippageModalOpen(true)}
                />
                <span className="text-lg text-gray-400">
                  Slippage: {slippage}%
                </span>
              </div>
            </div>
            <TokenSelector
              isOpen={isSellingOpen}
              setIsOpen={setIsSellingOpen}
              selectedToken={sellToken}
              setSelectedToken={setSellToken}
              label="You're Selling"
              amount={sellAmount}
              setAmount={setSellAmount}
              tokens={tokens}
              tokenUSD={sellTokenUSD}
              isReadOnly={false}
            />
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const temp = sellToken;
                  setSellToken(buyToken);
                  setBuyToken(temp);
                }}
                className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>
            <TokenSelector
              isOpen={isBuyingOpen}
              setIsOpen={setIsBuyingOpen}
              selectedToken={buyToken}
              setSelectedToken={setBuyToken}
              label="You're Buying"
              amount={buyAmount}
              setAmount={setBuyAmount}
              tokens={tokens}
              tokenUSD={buyTokenUSD}
              isReadOnly={true}
            />
            <button
              onClick={handleSwap}
              disabled={
                !wallet.connected || userBalance < parseFloat(sellAmount)
              }
              className="w-full bg-[#158a88] text-white p-3 rounded-xl font-bold hover:bg-[#288180] transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {wallet.connected
                ? userBalance >= parseFloat(sellAmount)
                  ? 'Swap'
                  : 'Insufficient funds'
                : 'Connect Wallet'}
            </button>
          </div>
          {quoteResponse && (
            <div className="mt-4 text-center text-gray-400">
              <p>
                Exchange Rate: 1 {sellToken?.symbol} ≈{' '}
                {parseFloat(buyAmount) / parseFloat(sellAmount) || 0}{' '}
                {buyToken?.symbol}
              </p>
            </div>
          )}
        </div>
      </div>

      <SlippageModal
        isOpen={isSlippageModalOpen}
        setIsOpen={setIsSlippageModalOpen}
        slippage={slippage}
        setSlippage={setSlippage}
      />
    </div>
  );
};

export default Swap;
