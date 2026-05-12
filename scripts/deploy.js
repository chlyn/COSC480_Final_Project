const hre = require("hardhat");

async function main() {
  const OrderReceipt = await hre.ethers.getContractFactory("OrderReceipt");
  const orderReceipt = await OrderReceipt.deploy();

  await orderReceipt.deployed();

  console.log("OrderReceipt deployed to:", orderReceipt.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});