// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

contract DestinationBridge is ReentrancyGuard, Ownable {
    // Mapping to track processed transfers
    mapping(bytes32 => bool) public processedTransfers;
    
    // Mapping to track bridge operators
    mapping(address => bool) public bridgeOperators;
    
    // Mapping to track wrapped tokens
    mapping(address => WrappedToken) public wrappedTokens;
    
    // Events
    event TokensMinted(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        bytes32 transferId
    );
    
    event TokensBurned(
        address indexed token,
        address indexed sender,
        uint256 amount,
        bytes32 transferId
    );
    
    event BridgeOperatorAdded(address indexed operator);
    event BridgeOperatorRemoved(address indexed operator);
    event WrappedTokenCreated(address indexed originalToken, address indexed wrappedToken);
    
    constructor() {
        bridgeOperators[msg.sender] = true;
    }
    
    modifier onlyBridgeOperator() {
        require(bridgeOperators[msg.sender], "Not a bridge operator");
        _;
    }
    
    function addBridgeOperator(address operator) external onlyOwner {
        bridgeOperators[operator] = true;
        emit BridgeOperatorAdded(operator);
    }
    
    function removeBridgeOperator(address operator) external onlyOwner {
        bridgeOperators[operator] = false;
        emit BridgeOperatorRemoved(operator);
    }
    
    function createWrappedToken(
        address originalToken,
        string memory name,
        string memory symbol
    ) external onlyOwner {
        require(address(wrappedTokens[originalToken]) == address(0), "Wrapped token already exists");
        
        WrappedToken wrappedToken = new WrappedToken(name, symbol);
        wrappedTokens[originalToken] = wrappedToken;
        
        emit WrappedTokenCreated(originalToken, address(wrappedToken));
    }
    
    function mintWrappedTokens(
        address originalToken,
        address recipient,
        uint256 amount,
        bytes32 transferId
    ) external onlyBridgeOperator nonReentrant {
        require(!processedTransfers[transferId], "Transfer already processed");
        require(amount > 0, "Amount must be greater than 0");
        
        WrappedToken wrappedToken = wrappedTokens[originalToken];
        require(address(wrappedToken) != address(0), "Wrapped token does not exist");
        
        processedTransfers[transferId] = true;
        wrappedToken.mint(recipient, amount);
        
        emit TokensMinted(originalToken, recipient, amount, transferId);
    }
    
    function burnWrappedTokens(
        address originalToken,
        uint256 amount,
        bytes32 transferId
    ) external nonReentrant {
        require(!processedTransfers[transferId], "Transfer already processed");
        require(amount > 0, "Amount must be greater than 0");
        
        WrappedToken wrappedToken = wrappedTokens[originalToken];
        require(address(wrappedToken) != address(0), "Wrapped token does not exist");
        
        processedTransfers[transferId] = true;
        wrappedToken.burn(msg.sender, amount);
        
        emit TokensBurned(originalToken, msg.sender, amount, transferId);
    }
    
    function getWrappedToken(address originalToken) external view returns (address) {
        return address(wrappedTokens[originalToken]);
    }
    
    function isTransferProcessed(bytes32 transferId) external view returns (bool) {
        return processedTransfers[transferId];
    }
} 