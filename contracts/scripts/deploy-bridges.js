const { ethers } = require("hardhat");

async function main() {
  // Deploy SourceBridge
  console.log("Deploying SourceBridge...");
  const SourceBridge = await ethers.getContractFactory("SourceBridge");
  const sourceBridge = await SourceBridge.deploy();
  await sourceBridge.deployed();
  console.log("SourceBridge deployed to:", sourceBridge.address);

  // Deploy DestinationBridge
  console.log("Deploying DestinationBridge...");
  const DestinationBridge = await ethers.getContractFactory("DestinationBridge");
  const destinationBridge = await DestinationBridge.deploy();
  await destinationBridge.deployed();
  console.log("DestinationBridge deployed to:", destinationBridge.address);

  // Deploy WETH for testing
  console.log("Deploying WETH...");
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH deployed to:", weth.address);

  // Create wrapped tokens for each network
  console.log("Creating wrapped tokens...");
  await destinationBridge.createWrappedToken(
    weth.address,
    "Wrapped ETH",
    "WETH"
  );
  console.log("Wrapped ETH created");

  // Add bridge operators
  const [deployer] = await ethers.getSigners();
  console.log("Adding bridge operators...");
  await sourceBridge.addBridgeOperator(deployer.address);
  await destinationBridge.addBridgeOperator(deployer.address);
  console.log("Bridge operators added");

  // Save deployment addresses
  const deploymentInfo = {
    sourceBridge: sourceBridge.address,
    destinationBridge: destinationBridge.address,
    weth: weth.address,
    deployer: deployer.address
  };

  // Save to a file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 