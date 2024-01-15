// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVoting {
    struct Option {
        string label;
        uint256 votes;
    }

    struct Poll {
        string title;
        string descriptionCid;
        bool multiple;
        uint64 startTime;
        uint64 endTime;
        bool closed;
        address creator;
        Option[] options;
    }

    event VoteCreated(uint256 indexed pollId, address indexed creator);
    event VoteCast(uint256 indexed pollId, address indexed voter, uint256[] optionIds);
    event VoteClosed(uint256 indexed pollId, address indexed closer);

    function createVote(
        string calldata title,
        string calldata descriptionCid,
        string[] calldata options,
        bool multiple,
        uint64 startTime,
        uint64 endTime
    ) external returns (uint256 pollId);

    function castVote(uint256 pollId, uint256[] calldata optionIds) external;

    function closeVote(uint256 pollId) external;

    function getVoteResults(uint256 pollId) external view returns (Option[] memory);
}
