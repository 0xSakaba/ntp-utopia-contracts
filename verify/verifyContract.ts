import hre from "hardhat";
import { sepolia_verify_address } from "../const";

const arg1 = "ipfs://";
async function main() {
  await hre.run("verify:verify", {
    address: "",
    constructorArguments: [arg1],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
