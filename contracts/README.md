# MetaMask Clone Bridge Contracts

This directory contains the smart contracts for the MetaMask Clone bridge functionality, enabling cross-chain token transfers between different networks.

## Prerequisites

- Node.js v14 or later
- npm or yarn
- A wallet with sufficient funds for deployment
- Infura API key (or other RPC provider)
- Etherscan API key (for contract verification)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment template and fill in your values:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your:
- RPC URLs for different networks
- Private key for deployment
- Etherscan API key
- Bridge operator addresses

## Deployment

### Test Networks

Deploy to Goerli testnet:
```bash
npm run deploy:testnet
```

### Main Networks

Deploy to Ethereum mainnet:
```bash
npm run deploy:mainnet
```

### Verify Contracts

After deployment, verify the contracts on Etherscan:
```bash
npm run verify --network goerli <CONTRACT_ADDRESS>
```

## Contract Addresses

After deployment, the contract addresses will be saved in `deployment.json`. Make sure to update these addresses in your frontend configuration.

## Testing

Run the test suite:
```bash
npm test
```

## Security Considerations

1. Always test thoroughly on testnets before mainnet deployment
2. Ensure bridge operators are properly configured
3. Monitor bridge operations for any suspicious activity
4. Keep private keys secure and never commit them to version control

## License

MIT 