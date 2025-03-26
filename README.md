# deploy

## sepolia

## soneium-minato

## soneium (mainnet)

# set up env

`yarn hardhat vars set ALCHEMY_API_KEY "YOUR_TOKEN_HERE"`
`yarn hardhat vars set ETHERSCAN_API_KEY "YOUR_TOKEN_HERE"`

`npx hardhat vars list`

deploy contract
```shell
npx hardhat ignition deploy ./ignition/modules/<contractName>.ts --network <network>
```

run scripts
```shell
npx hardhat run ./scripts/<scriptName>.ts --network <network>
```

contract verification
```shell
npx hardhat run ./verify/<name>.ts --network <network> <contractAddress>
```

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
