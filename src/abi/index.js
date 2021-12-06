const { ethers } = require('ethers')

const UniswapV2Pair = require('./UniswapV2Pair.json').abi
const OtterBondStakeDepository = require('./OtterBondStakeDepository.json').abi
const OtterMaticBondDepository = require('./OtterMaticBondDepository.json').abi
const StakingContract = require('./StakingContract.json').abi
const StakedClamTokenContract = require('./StakedClamTokenContract.json').abi
const ClamCirculatingSupply = require('./ClamCirculatingSupply.json').abi

const uniswapPairContract = (address, provider) =>
  new ethers.Contract(address, UniswapV2Pair, provider)
const bondContract = (address, provider, isMatic = false) =>
  isMatic
    ? new ethers.Contract(address, OtterMaticBondDepository, provider)
    : new ethers.Contract(address, OtterBondStakeDepository, provider)
const sClamStakingContract = (address, provider) =>
  new ethers.Contract(address, StakingContract, provider)
const sCLAMContract = (address, provider) =>
  new ethers.Contract(address, StakedClamTokenContract, provider)
const circulatingSupplyContract = (address, provider) =>
  new ethers.Contract(address, ClamCirculatingSupply, provider)

module.exports = {
  uniswapPairContract,
  bondContract,
  sClamStakingContract,
  sCLAMContract,
  circulatingSupplyContract,
}
