const { ethers } = require('ethers')

const DystRouter = require('./DystRouter.json')
const UniswapV2Pair = require('./UniswapV2Pair.json').abi
const OtterBondStakeDepository = require('./OtterBondStakeDepository.json').abi
const OtterMaticBondDepository = require('./OtterMaticBondDepository.json').abi
const OtterMaticLPBondDepository =
  require('./OtterMaticLPBondDepository.json').abi
const StakingContract = require('./StakingContract.json').abi
const StakedClamTokenContract = require('./StakedClamTokenContract.json').abi
const ClamCirculatingSupply = require('./ClamCirculatingSupply.json').abi
const OtterPearl = require('./OtterPearlERC20.json').abi

const dystRouterContract = (address, provider) =>
  new ethers.Contract(address, DystRouter, provider)
const uniswapPairContract = (address, provider) =>
  new ethers.Contract(address, UniswapV2Pair, provider)
const bondContract = (address, provider) =>
  new ethers.Contract(address, OtterBondStakeDepository, provider)
const bondNonStableCoinContract = (address, provider, isLP = false) =>
  isLP
    ? new ethers.Contract(address, OtterMaticLPBondDepository, provider)
    : new ethers.Contract(address, OtterMaticBondDepository, provider)

const sCLAMStakingContract = (address, provider) =>
  new ethers.Contract(address, StakingContract, provider)
const sCLAMContract = (address, provider) =>
  new ethers.Contract(address, StakedClamTokenContract, provider)
const PearlContract = (address, provider) =>
  new ethers.Contract(address, OtterPearl, provider)
const circulatingSupplyContract = (address, provider) =>
  new ethers.Contract(address, ClamCirculatingSupply, provider)

module.exports = {
  dystRouterContract,
  uniswapPairContract,
  bondContract,
  bondNonStableCoinContract,
  sCLAMStakingContract,
  sCLAMContract,
  PearlContract,
  circulatingSupplyContract,
}
