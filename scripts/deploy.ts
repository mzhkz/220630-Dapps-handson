import { ethers, artifacts } from "hardhat";
import fs from "fs";
import path from "path";
import { Contract } from "ethers";

async function main() {
  const [deployer] = await ethers.getSigners();
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const mynft = await MyNFT.deploy(
    "MyNFT",
    "BCL",
    "https://handsondappmoz.blob.core.windows.net/dapps-nft-images/"
  );
  await mynft.deployed();
  await mynft.mintTo(deployer.address, "1.json");
  const currentId = await mynft.totalSupply();
  const mintedTokenURI = await mynft.tokenURI(currentId);
  console.log(`MyNFT ERC721 was deployed to: ${mynft.address} at ${currentId}`);
  console.log(` A NFT is generated by: ${mintedTokenURI}`);
  generateABIFile(mynft, "MyNFT");
}

function generateABIFile(contract: Contract, contractName: string) {
  const contractsDir = path.join("/app/abis");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  fs.writeFileSync(
    contractsDir + `/${contractName}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );
  const ContractArtifact = artifacts.readArtifactSync(contractName);
  fs.writeFileSync(
    contractsDir + `/${contractName}.json`,
    JSON.stringify(ContractArtifact, undefined, 2)
  );
  console.log(` ${contractName} abi and address was saved at
${contractsDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});