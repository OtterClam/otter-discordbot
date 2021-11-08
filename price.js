const { ethers } = require("ethers");
const {
  MimTimeReserveContract,
  MimTimeBondContract,
  StakingContract,
} = require("./abi");

const {
  RESERVE_MAI_CLAM,
  BOND_MAI_CLAM,
  BOND_MAI,
  STAKING_ADDRESS,
} = require("./constant");

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mainnet.maticvigil.com/"
);

const bondContractMAI_CLAM = new ethers.Contract(
  BOND_MAI_CLAM,
  MimTimeBondContract,
  provider
);

const bondContractMAI = new ethers.Contract(
  BOND_MAI,
  MimTimeBondContract,
  provider
);

const pairContract = new ethers.Contract(
  RESERVE_MAI_CLAM,
  MimTimeReserveContract,
  provider
);

const stakingContract = new ethers.Contract(
  STAKING_ADDRESS,
  StakingContract,
  provider
);
const getRawMarketPrice = async () => {
  const reserves = await pairContract.getReserves();
  return reserves[1].div(reserves[0]);
};

const getRawBondPrice = async (bondType) => {
  if (bondType === "MAI") return bondContractMAI.bondPriceInUSD();
  if (bondType === "MAI_CLAM") return bondContractMAI_CLAM.bondPriceInUSD();
  throw Error(`Contract for bond doesn't support: ${bondType}`);
};

const getRawStakingBalance = async () => {
  return stakingContract.contractBalance();
};

module.exports = {
  getRawMarketPrice,
  getRawBondPrice,
  getRawStakingBalance,
};
