//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

interface IVotingEscrow{
    function balanceOf(address _account) external view returns (uint256);
}