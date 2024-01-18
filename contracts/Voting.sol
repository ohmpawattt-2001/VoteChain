// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IVoting} from "./IVoting.sol";

contract Voting is IVoting {
    mapping(uint256 => mapping(address => bool)) private hasVoted;
    Poll[] private polls;

    modifier onlyActive(uint256 pollId) {
        Poll storage p = polls[pollId];
        require(!p.closed, "closed");
        require(block.timestamp >= p.startTime, "not started");
        require(block.timestamp <= p.endTime, "ended");
        _;
    }

    function createVote(
        string calldata title,
        string calldata descriptionCid,
        string[] calldata options,
        bool multiple,
        uint64 startTime,
        uint64 endTime
    ) external returns (uint256 pollId) {
        require(bytes(title).length > 0, "title");
        require(options.length >= 2, "options");
        require(startTime < endTime, "time");

        Poll storage p = polls.push();
        p.title = title;
        p.descriptionCid = descriptionCid;
        p.multiple = multiple;
        p.startTime = startTime;
        p.endTime = endTime;
        p.creator = msg.sender;

        for (uint256 i = 0; i < options.length; i++) {
            p.options.push(Option({label: options[i], votes: 0}));
        }

        pollId = polls.length - 1;
        emit VoteCreated(pollId, msg.sender);
    }

    function castVote(uint256 pollId, uint256[] calldata optionIds) external onlyActive(pollId) {
        require(!hasVoted[pollId][msg.sender], "voted");
        Poll storage p = polls[pollId];
        if (!p.multiple) {
            require(optionIds.length == 1, "single");
        } else {
            require(optionIds.length > 0, "empty");
        }
        for (uint256 i = 0; i < optionIds.length; i++) {
            uint256 id = optionIds[i];
            require(id < p.options.length, "id");
            p.options[id].votes += 1;
        }
        hasVoted[pollId][msg.sender] = true;
        emit VoteCast(pollId, msg.sender, optionIds);
    }

    function closeVote(uint256 pollId) external {
        Poll storage p = polls[pollId];
        require(msg.sender == p.creator, "creator");
        require(!p.closed, "closed");
        p.closed = true;
        emit VoteClosed(pollId, msg.sender);
    }

    function getVoteResults(uint256 pollId) external view returns (Option[] memory) {
        Poll storage p = polls[pollId];
        Option[] memory result = new Option[](p.options.length);
        for (uint256 i = 0; i < p.options.length; i++) {
            result[i] = p.options[i];
        }
        return result;
    }
}
