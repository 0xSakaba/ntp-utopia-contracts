// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

/**
 * @title IERC721Copyright
 * @dev Interface for the ERC721Copyright extension
 */
interface IERC721Copyright is IERC721 {
    /**
     * @dev Signature detail
     */
    struct SignatureInfo {
        bool copyrightAgreementSigned;
        address signerAddress;
        bytes copyrightSignature;
        uint256 licenseVersion;
    }

    /**
     * @dev License version and metadata
     */
    struct LicenseInfo {
        string uri; // URI pointing to the license document
        bytes32 contentHash; // Hash of the license content
        uint256 version; // Version number of the license
        uint256 timestamp; // When this version was established
    }

    /**
     * @dev Emitted when the copyright license is set or updated
     */
    event CopyrightLicenseUpdated(
        string licenseURI,
        bytes32 contentHash,
        uint256 version,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a user accepts the license for a specific token
     */
    event LicenseAccepted(
        address indexed user,
        uint256 indexed tokenId,
        uint256 licenseVersion,
        bytes signature
    );

    /**
     * @dev Emitted when a user's license for a specific token is revoked
     */
    event LicenseRevoked(address indexed user, uint256 indexed tokenId, uint256 licenseVersion);

    /**
     * @dev Returns the current license information
     */
    function copyrightLicense() external view returns (LicenseInfo memory);

    /**
     * @dev Sets or updates the copyright license
     * @param licenseURI The URI pointing to the license document
     * @param contentHash The hash of the license content for verification
     * @return version The new version number assigned to this license update
     */
    function setCopyrightLicense(
        string calldata licenseURI,
        bytes32 contentHash
    ) external returns (uint256 version);

    /**
     * @dev Records user acceptance of the current license for multiple tokens at once
     * @param tokenIds Array of token IDs that the user is accepting the license for
     * @param signature The user's signature of acceptance
     */
    function acceptLicenseForTokens(uint256[] calldata tokenIds, bytes calldata signature) external;

    /**
     * @dev Retrieves license acceptance signatures for tokens
     * @param tokenIds Array of token IDs to check
     * @return signatures Array of signatures for each corresponding token
     */
    function getLicenseSignatures(
        uint256[] calldata tokenIds
    ) external view returns (SignatureInfo[] memory signatures);
}
