import { Token } from '@/types/swap';
import axios from 'axios';

export const fetchTokens = async (): Promise<Token[]> => {
  try {
    const response = await axios.get(
      'https://tokens.jup.ag/tokens?tags=verified'
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const handleCalculateOutAmts = (amt: number, token: Token): number => {
  if (
    (token.symbol === 'USDC' || token.symbol === 'USDT') &&
    token.address.startsWith('EPj')
  ) {
    return amt / Math.pow(10, 6);
  }
  return amt / Math.pow(10, token.decimals);
};

export const fetchUsdPrice = async (token: Token): Promise<number> => {
  const response = await axios.get(
    `https://api.jup.ag/price/v2?ids=${token.address}`
  );
  return response.data.data[token.address].price;
};
