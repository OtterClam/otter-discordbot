const { ethers, BigNumber } = require('ethers')
const {
  OtterBondStakeDepository,
  StakingContract,
  StakedClamTokenContract,
  UniswapV2Pair,
  ClamCirculatingSupply,
} = require('./abi')
const {
  RESERVE_MAI_CLAM,
  RESERVE_FRAX_CLAM,
  BOND_MAI44,
  BOND_FRAX44,
  BOND_MAI_CLAM44,
  BOND_FRAX_CLAM44,
  STAKING_ADDRESS,
  sCLAM_ADDRESS,
  CLAM_ADDRESS,
  CLAM_CIRCULATING_SUPPLY,
} = require('./constant')

const provider = new ethers.providers.JsonRpcProvider(
  'https://rpc-mainnet.maticvigil.com/',
)

const bondContractMAI44 = new ethers.Contract(
  BOND_MAI44,
  OtterBondStakeDepository,
  provider,
)
const bondContractFRAX44 = new ethers.Contract(
  BOND_FRAX44,
  OtterBondStakeDepository,
  provider,
)
const bondContractMAI_CLAM44 = new ethers.Contract(
  BOND_MAI_CLAM44,
  OtterBondStakeDepository,
  provider,
)
const bondContractFRAX_CLAM44 = new ethers.Contract(
  BOND_FRAX_CLAM44,
  OtterBondStakeDepository,
  provider,
)
const pairContractMAI_CLAM = new ethers.Contract(
  RESERVE_MAI_CLAM,
  UniswapV2Pair,
  provider,
)
const pairContractFRAX_CLAM = new ethers.Contract(
  RESERVE_FRAX_CLAM,
  UniswapV2Pair,
  provider,
)
const sCLAMContract = new ethers.Contract(
  sCLAM_ADDRESS,
  StakedClamTokenContract,
  provider,
)

const clamCirculatingSupply = new ethers.Contract(
  CLAM_CIRCULATING_SUPPLY,
  ClamCirculatingSupply,
  provider,
)
const stakingContract = new ethers.Contract(
  STAKING_ADDRESS,
  StakingContract,
  provider,
)

const pairContractAndAddress = {
  MAI: { contract: pairContractMAI_CLAM, address: RESERVE_MAI_CLAM },
  FRAX: { contract: pairContractFRAX_CLAM, address: RESERVE_FRAX_CLAM },
}
const getRawMarketPrice = async (coinType = 'MAI') => {
  const data = pairContractAndAddress[coinType]
  if (data === undefined) throw Error(`Coin type not supported: ${coinType}`)
  const { contract, address } = data

  const reserves = await contract.getReserves()
  const [clam, coin] = BigNumber.from(address).gt(CLAM_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]]
  const marketPrice = coin.div(clam)
  return marketPrice
}

const bondTypeToTitle = {
  MAI44: 'MAI (4,4)',
  FRAX44: 'FRAX (4,4)',
  MAI_CLAM44: 'MAI/CLAM (4,4)',
  FRAX_CLAM44: 'FRAX/CLAM (4,4)',
}
const bondContract = {
  MAI44: bondContractMAI44,
  FRAX44: bondContractFRAX44,
  MAI_CLAM44: bondContractMAI_CLAM44,
  FRAX_CLAM44: bondContractFRAX_CLAM44,
}
const bondTypeToCoinType = {
  MAI44: 'MAI',
  FRAX44: 'MAI',
  // FRAX44: 'FRAX',
  MAI_CLAM44: 'MAI',
  // FRAX_CLAM44: 'FRAX',
  FRAX_CLAM44: 'MAI',
}
const getRawBondPrice = async (bondType) => {
  if (bondContract[bondType] === undefined)
    throw Error(`Contract type not supported: ${bondType}`)
  return bondContract[bondType].bondPriceInUSD()
}
const getBondInfo = async (bondType) => {
  const title = bondTypeToTitle[bondType]
  const rawMarketPrice = await getRawMarketPrice(bondTypeToCoinType[bondType])
  const rawBondPrice = await getRawBondPrice(bondType)
  const bondDiscount = (rawMarketPrice * 1e9 - rawBondPrice) / rawBondPrice
  return {
    title,
    price: Number(rawBondPrice / 1e18).toFixed(2),
    roi: Number(100 * bondDiscount).toFixed(2),
  }
}

const getBondFiveDayROI = async () => {
  const sClamCirc = (await sCLAMContract.circulatingSupply()) / 1e9
  const epoch = await stakingContract.epoch()
  const stakingReward = epoch.distribute / 1e9
  const stakingRebase = stakingReward / sClamCirc
  const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1
  return Number(100 * fiveDayRate).toFixed(2)
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
  return Number(
    (await clamCirculatingSupply.CLAMCirculatingSupply()) / 1e9,
  ).toFixed(0)
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
  getRawStakingBalance,
  getEpoch,
  getTotalSupply,
  getMarketCap,
  getMarketPrice,
  getStakingTVL,
  getBondFiveDayROI,
  getBondInfo,
}
