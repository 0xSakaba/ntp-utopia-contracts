// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

import './extensions/ERC721Copyright.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/Base64.sol';
import '@openzeppelin/contracts/interfaces/IERC4906.sol';
import '@openzeppelin/contracts/interfaces/IERC165.sol';

contract NeoTokyoPunks is ERC721Copyright, AccessControl, IERC4906 {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    uint256 public maxSupply;
    uint256 public nextId = 1;
    
    string public collectionDescription;

    constructor(string memory name_, string memory symbol_) 
        ERC721Copyright(name_, symbol_, msg.sender) 
    {
        maxSupply = 10000;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        collectionDescription = "sample desc";
    }
    
    function setDescription(string memory newDescription) external onlyOwner {
        collectionDescription = newDescription;
        // Emit event for the entire collection update
        emit BatchMetadataUpdate(1, type(uint256).max);
    }

    function _afterSignatureUpdate(
        uint256 tokenId,
        bool signed,
        address signer,
        bytes memory signature
    ) internal virtual override {
        super._afterSignatureUpdate(tokenId, signed, signer, signature);
        // Emit metadata update event when signature status changes
        emit MetadataUpdate(tokenId);
    }

    function mint(address to) public override onlyRole(MINTER_ROLE) {
        require(nextId <= maxSupply, 'NeoTokyoPunks: MaxSupplyExceeded');
        _safeMint(to, nextId);
        nextId += 1;
    }

    function batchMint(address to, uint256 amount) public override onlyRole(MINTER_ROLE) {
        require(amount > 0, 'NeoTokyoPunks: InvalidAmount');
        require(nextId + amount - 1 <= maxSupply, 'NeoTokyoPunks: MaxSupplyExceeded');
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, nextId);
            nextId += 1;
        }
    }

    function grantMinterRole(address account) public onlyOwner {
        grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) public onlyOwner {
        revokeRole(MINTER_ROLE, account);
    }

    function _generateMetadata(uint256 tokenId) internal view returns (string memory) {
        _requireOwned(tokenId);
        
        // Get signature info for the token
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = tokenId;
        SignatureInfo[] memory signatures = getLicenseSignatures(tokenIds);
        
        // Check if license is agreed
        string memory licenseStatus = signatures[0].copyrightAgreementSigned ? "Yes" : "No";
        
        // Create the attributes array
        string memory attributes = string(abi.encodePacked(
            '[{"trait_type": "license_agreed", "value": "', 
            licenseStatus,
            '"}]'
        ));

        // Create the full metadata JSON using stored description
        string memory json = Base64.encode(
            bytes(string(abi.encodePacked(
                '{"name": "NeoTokyoPunk #', 
                Strings.toString(tokenId),
                '", "description": "',
                collectionDescription,
                '", "image": "sample.png", "attributes": ',
                attributes,
                '}'
            )))
        );

        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        return _generateMetadata(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC721Copyright, AccessControl) returns (bool) {
        return interfaceId == type(IERC4906).interfaceId || super.supportsInterface(interfaceId);
    }
}
