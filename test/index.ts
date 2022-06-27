import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractFactory, Contract, Signer } from "ethers";

describe("Mint Token", () => {
  // 共通で用いる変数などを定義しておく
  let deployer: Signer;
  let contract: Contract;
  beforeEach(async () => {
    // it関数を実行する前に、毎度この関数が呼ばれます。
    // ここにはスマートコントラクトをデプロイするコードを記述します。
    const accounts: Signer[] = await ethers.getSigners();
    deployer = accounts[0];
    const MyNFT: ContractFactory = await ethers.getContractFactory("MyNFT");
    contract = await MyNFT.deploy(
      "MYNFT",
      "NFT",
      "https://handsondappmoz.blob.core.windows.net/dapps-nft-images/"
    );
    await contract.deployed();
  });
  it("check totalsupply", async () => {
    // ここにはトークンを発行し、totalSupplyが+1されているかを確認します。
    expect(await contract.totalSupply()).to.equal(0);
    await contract.mintTo(await deployer.getAddress(), "1.json");
    expect(await contract.totalSupply()).to.equal(1);
  });
  it("check metadata (uri and description)", async () => {
    const _testPath = "1.json";
    expect(await contract.totalSupply()).to.equal(0);
    await contract.mintTo(await deployer.getAddress(), _testPath);
    const tokenId = await contract.totalSupply();
    expect(await contract.tokenURI(tokenId)).to.include(_testPath);
  });
});
