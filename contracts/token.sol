// SPDX-License-Identifier: MIT
pragma solidity >0.6.0 <= 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {

    // address public manager;

    constructor(address addr1) ERC20('Jagtap Coin', 'JAGGU') { 
        _mint(addr1, 10000 * 1 ** 18);
    } 
}
