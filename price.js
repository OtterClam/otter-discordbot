const { ethers } = require('ethers')
const {
  MimTimeReserveContract,
  MimTimeBondContract,
  StakingContract,
  ClamTokenContract,
  ClamCirculatingSupply,
} = require('./abi')
const {
  RESERVE_MAI_CLAM,
  BOND_MAI_CLAM,
  BOND_MAI,
  STAKING_ADDRESS,
  CLAM_ADDRESS,
  CLAM_CIRCULATING_SUPPLY,
} = require('./constant')

const provider = new ethers.providers.JsonRpcProvider('https://rpc-mainnet.maticvigil.com/')
const bondContractMAI_CLAM = new ethers.Contract(BOND_MAI_CLAM, MimTimeBondContract, provider)
const bondContractMAI = new ethers.Contract(BOND_MAI, MimTimeBondContract, provider)
const pairContract = new ethers.Contract(RESERVE_MAI_CLAM, MimTimeReserveContract, provider)
const clamContract = new ethers.Contract(CLAM_ADDRESS, ClamTokenContract, provider)
const clamCirculatingSupply = new ethers.Contract(CLAM_CIRCULATING_SUPPLY, ClamCirculatingSupply, provider)

const stakingContract = new ethers.Contract(STAKING_ADDRESS, StakingContract, provider)
const getRawMarketPrice = async () => {
  const reserves = await pairContract.getReserves()
  return reserves[1].div(reserves[0])
}

const getRawBondPrice = async (bondType) => {
  if (bondType === 'MAI') return bondContractMAI.bondPriceInUSD()
  if (bondType === 'MAI_CLAM') return bondContractMAI_CLAM.bondPriceInUSD()
  throw Error(`Contract for bond doesn't support: ${bondType}`)
}

const getBondROI = async (bondType, rawPrice) => {
  const rawMarketPrice = await getRawMarketPrice()
  const rawBondPrice = rawPrice || (await getRawBondPrice(bondType))
  const bondDiscount = (rawMarketPrice * 1e9 - rawBondPrice) / rawBondPrice
  return Number(100 * bondDiscount).toFixed(2)
}

const getRawStakingBalance = async () => {
  return stakingContract.contractBalance()
}

const getEpoch = async () => {
  const { number, endTime } = await stakingContract.epoch()
  const currentBlock = await provider.getBlockNumber()
  const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp
  return {
    epoch: number.toNumber(),
    currentBlockTime,
    currentEndTime: endTime.toNumber(),
  }
}

const getTotalSupply = async () => {
  return Number((await clamContract.totalSupply()) / 1e9).toFixed(0)
}

const getStakingTVL = async (rawPrice) => {
  const rawMarketPrice = rawPrice || (await getRawMarketPrice())
  const stakingBalance = await getRawStakingBalance()
  return Number((stakingBalance * rawMarketPrice) / 1e18).toFixed(0)
}

const getMarketCap = async (rawPrice) => {
  const rawMarketPrice = rawPrice || (await getRawMarketPrice())
  const circSupply = await clamCirculatingSupply.CLAMCirculatingSupply()
  return Number((circSupply * rawMarketPrice) / 1e18).toFixed(0)
}

const getMarketPrice = async (rawPrice) => {
  const rawMarketPrice = rawPrice || (await getRawMarketPrice())
  return Number((rawMarketPrice.toNumber() / 1e9).toFixed(4))
}

module.exports = {
  getRawMarketPrice,
  getRawBondPrice,
  getRawStakingBalance,
  getEpoch,
  getTotalSupply,
  getMarketCap,
  getMarketPrice,
  getStakingTVL,
  getBondROI,
}
