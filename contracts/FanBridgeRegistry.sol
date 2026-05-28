// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FanBridgeRegistry
/// @notice On-chain registry of fans and their match predictions for the
///         FanBridge AI sports-prediction product. Designed for the
///         OKX X Layer "Build X Hackathon" submission.
contract FanBridgeRegistry {
    struct Prediction {
        string matchId;
        string pick;
        uint256 timestamp;
    }

    mapping(address => bool) public registered;
    mapping(address => Prediction[]) private _predictions;

    uint256 public totalFans;
    uint256 public totalPredictions;

    event FanRegistered(address indexed fan, uint256 fanIndex);
    event PredictionMade(address indexed fan, string matchId, string pick, uint256 predictionIndex);

    function register() external {
        require(!registered[msg.sender], "already registered");
        registered[msg.sender] = true;
        totalFans += 1;
        emit FanRegistered(msg.sender, totalFans);
    }

    function predict(string calldata matchId, string calldata pick) external {
        require(registered[msg.sender], "not registered");
        _predictions[msg.sender].push(Prediction({
            matchId: matchId,
            pick: pick,
            timestamp: block.timestamp
        }));
        totalPredictions += 1;
        emit PredictionMade(msg.sender, matchId, pick, _predictions[msg.sender].length);
    }

    function getPredictions(address fan) external view returns (Prediction[] memory) {
        return _predictions[fan];
    }

    function predictionCount(address fan) external view returns (uint256) {
        return _predictions[fan].length;
    }
}
