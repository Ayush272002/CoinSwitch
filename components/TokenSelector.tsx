import { Token } from '@/types/swap';
import { ChevronDown } from 'lucide-react';
import React from 'react';

interface TokenSelectorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedToken: Token | null;
  setSelectedToken: (token: Token) => void;
  label: string;
  amount: string;
  setAmount: (amount: string) => void;
  tokens: Token[];
  tokenUSD: number | null;
  isReadOnly: boolean;
}

const TokenSelector = ({
  isOpen,
  setIsOpen,
  selectedToken,
  setSelectedToken,
  label,
  amount,
  setAmount,
  tokens,
  tokenUSD,
  isReadOnly,
}: TokenSelectorProps) => {
  return (
    <div className="w-full border rounded-xl border-gray-700 bg-gray-800 p-3 relative">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <div className="flex justify-between items-center">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer select-none bg-gray-700 text-sm py-2 px-3 rounded flex items-center justify-between w-full max-w-[12rem]"
        >
          <div className="flex items-center gap-2">
            {selectedToken && (
              <img
                src={selectedToken.logoURI || '/placeholder.svg'}
                className="w-10 h-10 rounded-full"
                alt={selectedToken.symbol}
              />
            )}
            <h3 className="font-bold text-base">
              {selectedToken?.symbol || ''}
            </h3>
          </div>
          <ChevronDown className="ml-2 w-4 h-4" />
        </div>
        <div className="flex flex-col items-end">
          <input
            className="w-full text-right bg-transparent text-xl border-none outline-none mt-2"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            onFocus={(e) => e.target.select()}
            readOnly={isReadOnly}
          />
          {tokenUSD && (
            <p className="text-lg flex justify-end font-bold text-gray-600 mt-2">
              ${tokenUSD.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full max-w-[12rem] max-h-40 overflow-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          {tokens.map((token) => (
            <div
              key={token.address}
              className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                setSelectedToken(token);
                setIsOpen(false);
              }}
            >
              <img
                src={token.logoURI || '/placeholder.svg'}
                alt={token.symbol}
                className="w-10 h-10 rounded-full mr-2"
              />
              <span>{token.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
