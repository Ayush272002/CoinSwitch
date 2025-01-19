# CoinSwitch

CoinSwitch is a decentralized token swapping application built on the Solana blockchain. It allows users to seamlessly exchange tokens, view balances, and manage slippage settings—all within an intuitive and user-friendly interface.

## Features

- **Token Swapping**: Swap tokens on the Solana network using the Jupiter Aggregator API.
- **Wallet Integration**: Connect your wallet via Solana Wallet Adapter for secure transactions.
- **Token Balances**: View real-time token balances.
- **Slippage Settings**: Configure slippage tolerance to prevent unexpected outcomes during swaps.
- **Live Exchange Rates**: See the real-time exchange rate for your selected tokens.
- **Responsive Design**: Fully responsive and optimized for mobile and desktop users.

## Technology Stack

- **Frontend**: React.js, Next.js
- **Blockchain**: Solana
- **Libraries**:
  - `@solana/web3.js`: Interact with the Solana blockchain.
  - `@solana/wallet-adapter-react`: Wallet integration for Solana.
  - `axios`: Fetch data from APIs.
  - `react-toastify`: Toast notifications for user feedback.
  - `lucide-react`: Icons for a modern UI.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- A wallet that supports Solana, e.g., Phantom.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Ayush272002/CoinSwitch.git
   cd CoinSwitch
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Development Server**

   ```bash
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:3000`.

## Configuration

- Update the Solana cluster endpoint in the `Connection` object (`https://api.devnet.solana.com`) if required. For example, to switch to the mainnet:

  ```typescript
  const connection = new Connection(
    'https://api.mainnet-beta.solana.com',
    'confirmed'
  );
  ```

- The swap uses Jupiter Aggregator's API for quotes. Ensure you have network access to the API endpoints.

## Usage

1. Connect your wallet using the "Connect Wallet" button.
2. Select tokens for swapping from the dropdown lists.
3. Enter the amount of tokens to sell.
4. (Optional) Adjust slippage tolerance by clicking the gear icon.
5. Click **Swap** to complete the transaction.

## Deployment

1. Build the project for production:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature name"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Jupiter Aggregator](https://jup.ag) for providing the swap API.
- [Solana](https://solana.com) for the blockchain infrastructure.
- [Phantom](https://phantom.app) for wallet integration support.

## Contact

For questions, issues, or feature requests, please contact [Ayush272002](https://github.com/Ayush272002).
