// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

import "./extensions/ERC721Copyright.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract NeoTokyoPunksUtopia is ERC721Copyright, IERC4906 {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    IERC20 public immutable astar;
    uint256 public MAX_SUPPLY;
    string private baseURI;
    uint256[8] public startTimes; // WL0, Gap1, WL1-1, WL1-2, WL2, Gap2, WL3, Public
    uint256[4] public ethPrice; // WL1, WL2, WL3, PUBLIC
    uint256[4] public astarPrice;
    uint256[4] public stageLimit; // WL0, WL1, WL2, WL3
    mapping(uint256 => mapping(address => uint256)) public mintLimit; // WL0, WL1, WL2, WL3 => address => amount

    constructor(
        address astarAddress,
        uint256[8] memory startTimes_,
        uint256[4] memory ethPrice_,
        uint256[4] memory astarPrice_,
        uint256[4] memory stageLimit_,
        string memory baseUri_
    ) ERC721Copyright("NEO TOKYO PUNKS Utopia", "NTP Utopia", msg.sender) {
        MAX_SUPPLY = 15_000;
        astar = IERC20(astarAddress);
        baseURI = baseUri_;
        startTimes = startTimes_;
        ethPrice = ethPrice_;
        astarPrice = astarPrice_;
        stageLimit = stageLimit_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintable(address minter) public view returns (uint256) {
        uint256 currentStage = _getCurrentStage();
        if (currentStage == type(uint256).max) {
            return 0;
        }

        uint256 whitelistId = _getWhitelistId(currentStage);
        uint256 stageLimitAmount = whitelistId == type(uint256).max
            ? 0
            : whitelistId == 4
            ? type(uint256).max
            : stageLimit[whitelistId];

        uint256 walletLimit;
        if (currentStage == 3 && mintLimit[1][minter] > 0) {
            /// stage 1 applies WL but not limit
            walletLimit = type(uint256).max;
        } else if (currentStage == 7) {
            walletLimit = type(uint256).max;
        } else {
            walletLimit = mintLimit[whitelistId][minter];
        }

        uint256 txLimit = (currentStage == 3 || currentStage == 7)
            ? 10
            : type(uint256).max;

        return Math.min(Math.min(stageLimitAmount, walletLimit), txLimit);
    }

    function mint(uint256 quantity) external payable {
        require(quantity > 0, "NEO TOKYO PUNKS Utopia: InvalidQuantity");

        uint256 mintableAmount = mintable(msg.sender);
        require(
            quantity <= mintableAmount,
            "NEO TOKYO PUNKS Utopia: ExceedsMintable"
        );

        _updateMintable(msg.sender, quantity);

        (uint256 ethPrice_, uint256 astarPrice_) = _getPrice();

        // infer paying with ETH
        if (msg.value > 0) {
            require(
                msg.value == ethPrice_ * quantity,
                "NEO TOKYO PUNKS Utopia: InvalidEthPrice"
            );
        } else {
            uint256 astarValue = astarPrice_ * quantity;
            require(
                astar.balanceOf(msg.sender) >= astarValue,
                "NEO TOKYO PUNKS Utopia: InsufficientAstarBalance"
            );
            astar.safeTransferFrom(msg.sender, address(this), astarValue);
        }

        uint256 totalSupply_ = totalSupply();
        while (quantity > 0) {
            unchecked {
                quantity--;
            }
            _mint(msg.sender, ++totalSupply_);
        }
    }

    function adminMint(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "NEO TOKYO PUNKS Utopia: MaxSupplyExceeded"
        );
        for (uint256 i = 0; i < amount; i++) {
            _mint(to, totalSupply() + 1);
        }
    }

    function batchUpdateWhitelist(
        uint256 stage,
        address[] memory addresses,
        uint256[] memory amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(stage < 5, "NEO TOKYO PUNKS Utopia: InvalidWhitelistId");
        uint256 i = addresses.length;
        require(
            i == amount.length,
            "NEO TOKYO PUNKS Utopia: InvalidArrayLength"
        );
        do {
            unchecked {
                i--;
            }
            mintLimit[stage][addresses[i]] = amount[i];
        } while (i > 0);
    }

    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "NEO TOKYO PUNKS Utopia: NoBalance");
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "NEO TOKYO PUNKS Utopia: WithdrawFailed");

        uint256 astarBalance = astar.balanceOf(address(this));
        if (astarBalance > 0) {
            astar.safeTransfer(msg.sender, astarBalance);
        }
    }

    function setBaseURI(
        string memory newBaseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = newBaseURI;
    }

    function _updateMintable(address minter, uint256 amount) internal {
        uint256 currentStage = _getCurrentStage();
        uint256 whitelistId = _getWhitelistId(currentStage);

        if (whitelistId < 4) {
            stageLimit[whitelistId] -= amount;
        }

        // stage 0, 2, 3 apply the wallet limit
        if (currentStage != 3 && currentStage != 7) {
            mintLimit[whitelistId][minter] -= amount;
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = tokenId;
        SignatureInfo[] memory signatures = getLicenseSignatures(tokenIds);

        return
            string.concat(
                baseURI,
                tokenId.toString(),
                signatures[0].copyrightAgreementSigned
                    ? "-signed"
                    : "-unsigned",
                ".json"
            );
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

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC721Copyright) returns (bool) {
        return
            interfaceId == type(IERC4906).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _getCurrentStage() internal view returns (uint256) {
        uint256 i = startTimes.length;
        do {
            unchecked {
                --i;
            }

            if (block.timestamp >= startTimes[i]) {
                return i;
            }
        } while (i > 0);
        return type(uint256).max;
    }

    function _getWhitelistId(uint256 stage) internal pure returns (uint256) {
        if (stage == 0) {
            return 0;
        }
        if (stage == 2 || stage == 3) {
            return 1;
        }
        if (stage == 4) {
            return 2;
        }
        if (stage == 6) {
            return 3;
        }
        if (stage == 7) {
            return 4;
        }
        // no whitelist apply
        return type(uint256).max;
    }

    function _getPrice()
        internal
        view
        returns (uint256 ethPrice_, uint256 astarPrice_)
    {
        uint256 currentStage = _getCurrentStage();
        uint256 whitelistId = _getWhitelistId(currentStage);
        if (whitelistId == 0) {
            return (0, 0);
        }
        if (whitelistId == type(uint256).max) {
            return (type(uint256).max, type(uint256).max);
        }
        return (ethPrice[whitelistId - 1], astarPrice[whitelistId - 1]);
    }
}
