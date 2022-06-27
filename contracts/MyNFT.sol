// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _nextTokenId;
    string private _baseTokenURI;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseUri
    ) ERC721(_name, _symbol) {
        _baseTokenURI = _baseUri;
    }

    function mintTo(
        address _to,
        string memory _tokenURL,
        string memory _description
    ) public onlyOwner {
        _nextTokenId.increment();
        uint256 currentTokenId = _nextTokenId.current();
        _safeMint(_to, currentTokenId);
        _setTokenURI(currentTokenId, _tokenURL);
        _setDescription(currentTokenId, _description);
        console.log("Minted at id:", currentTokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId.current();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
