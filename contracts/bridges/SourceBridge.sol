// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SourceBridge is ReentrancyGuard, Ownable {
    // Mapping to track locked tokens
    mapping(address => mapping(address => uint256)) public lockedTokens;
    
    // Mapping to track bridge operators
    mapping(address => bool) public bridgeOperators;
    
    // Events
    event TokensLocked(
        address indexed token,
        address indexed sender,
        address indexed destinationNetwork,
        uint256 amount,
        bytes32 transferId
    );
    
    event TokensUnlocked(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        bytes32 transferId
    );
    
    event BridgeOperatorAdded(address indexed operator);
    event BridgeOperatorRemoved(address indexed operator);
    
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
    
    function lockTokens(
        address token,
        address destinationNetwork,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        lockedTokens[token][msg.sender] += amount;
        
        bytes32 transferId = keccak256(abi.encodePacked(
            token,
            msg.sender,
            destinationNetwork,
            amount,
            block.timestamp
        ));
        
        emit TokensLocked(token, msg.sender, destinationNetwork, amount, transferId);
    }
    
    function unlockTokens(
        address token,
        address recipient,
        uint256 amount,
        bytes32 transferId
    ) external onlyBridgeOperator nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(lockedTokens[token][recipient] >= amount, "Insufficient locked tokens");
        
        lockedTokens[token][recipient] -= amount;
        require(IERC20(token).transfer(recipient, amount), "Transfer failed");
        
        emit TokensUnlocked(token, recipient, amount, transferId);
    }
    
    function getLockedBalance(address token, address account) external view returns (uint256) {
        return lockedTokens[token][account];
    }
} 