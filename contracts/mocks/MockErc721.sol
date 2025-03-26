// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockErc721 is ERC721 {
    string private __baseURI;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function setBaseURI(string memory baseURI) external {
        __baseURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }
}
