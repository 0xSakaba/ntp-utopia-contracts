// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

import "./IERC721Copyright.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

abstract contract ERC721Copyright is
    IERC721Copyright,
    ERC721Enumerable,
    AccessControl
{
    mapping(uint256 => SignatureInfo) private _signatures;
    LicenseInfo private licenseInfo;

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner
    ) ERC721(name_, symbol_) {}

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address from) {
        from = super._update(to, tokenId, auth);

        if (from != to) {
            if (from == address(0)) {
                _updateSignature(tokenId, true, to, "");
            } else {
                _updateSignature(tokenId, false, address(0), "");
            }
        }
    }

    function _updateSignature(
        uint256 tokenId,
        bool signed,
        address signer,
        bytes memory signature
    ) internal virtual {
        uint256 licenseVersion = licenseInfo.version;
        _signatures[tokenId] = SignatureInfo({
            copyrightAgreementSigned: signed,
            signerAddress: signer,
            copyrightSignature: signature,
            licenseVersion: licenseVersion
        });
        if (signed) {
            emit LicenseAccepted(signer, tokenId, licenseVersion, signature);
        } else {
            emit LicenseRevoked(signer, tokenId, licenseVersion);
        }

        // Hook for additional processing after signature update
        _afterSignatureUpdate(tokenId, signed, signer, signature);
    }

    /**
     * @dev Hook that is called after a signature update.
     * Can be used by derived contracts to implement additional logic.
     * @param tokenId The token ID that was updated
     * @param signed Whether the license was signed or revoked
     * @param signer The address that signed or revoked
     * @param signature The signature data
     */
    function _afterSignatureUpdate(
        uint256 tokenId,
        bool signed,
        address signer,
        bytes memory signature
    ) internal virtual {
        // Default empty implementation
    }

    function _isSignatureValid(
        bytes memory signature,
        address signer
    ) private view returns (bool) {
        bytes32 hash = licenseInfo.contentHash;
        // verify hash signed via `personal_sign`
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        return ECDSA.recover(ethSignedMessageHash, signature) == signer;
    }

    function copyrightLicense() public view returns (LicenseInfo memory) {
        return licenseInfo;
    }

    function setCopyrightLicense(
        string calldata licenseURI,
        bytes32 contentHash
    ) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 version) {
        uint256 licenseVersion = licenseInfo.version + 1;
        uint256 timestamp = block.timestamp;
        licenseInfo = LicenseInfo({
            uri: licenseURI,
            contentHash: contentHash,
            version: licenseVersion,
            timestamp: timestamp
        });
        emit CopyrightLicenseUpdated(
            licenseURI,
            contentHash,
            licenseVersion,
            timestamp
        );
        return licenseVersion;
    }

    function acceptLicenseForTokens(
        uint256[] memory tokenIds,
        bytes memory signature
    ) public {
        address signer = msg.sender;
        bool signed = _isSignatureValid(signature, signer);
        require(signed, "ERC721Copyright: signature error");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            address owner = _requireOwned(tokenId);
            require(owner == signer, "ERC721Copyright: caller is not owner");
            _updateSignature(tokenId, signed, signer, signature);
        }
    }

    function getLicenseSignatures(
        uint256[] memory tokenIds
    ) public view returns (SignatureInfo[] memory) {
        SignatureInfo[] memory signatureInfos = new SignatureInfo[](
            tokenIds.length
        );
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            _requireOwned(tokenId);
            signatureInfos[i] = _signatures[tokenId];
        }
        return signatureInfos;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IERC721Copyright).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
