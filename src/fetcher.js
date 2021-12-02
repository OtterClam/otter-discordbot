const { BigNumber } = require('ethers')
const {
  provider,
  bondContract_MAI44,
  bondContract_FRAX44,
  bondContract_MAI_CLAM44,
  bondContract_FRAX_CLAM44,
  pairContract_MAI_CLAM,
  pairContract_FRAX_CLAM,
  stakingContract,
  sCLAM,
  circulatingSupply_CLAM,
} = require('./contract')

const {
  RESERVE_MAI_CLAM,
  RESERVE_FRAX_CLAM,
  CLAM_ADDRESS,
} = require('./constant')

const coinToPairContract = {
  MAI: pairContract_MAI_CLAM,
  FRAX: pairContract_FRAX_CLAM,
}
const coinToAddress = {
  MAI: RESERVE_MAI_CLAM,
  FRAX: RESERVE_FRAX_CLAM,
}
const getRawMarketPrice = async (coin = 'MAI') => {
  const pairContract = coinToPairContract[coin]
  const address = coinToAddress[coin]
  if (pairContract === undefined || address === undefined)
    throw Error(`Coin type not supported: ${coin}`)

  const reserves = await pairContract.getReserves()
  const [p0, p1] = BigNumber.from(address).gt(CLAM_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]]
  const marketPrice = p1.div(p0)
  return marketPrice
}

const bondTypeToTitle = {
  MAI44: 'MAI (4,4)',
  FRAX44: 'FRAX (4,4)',
  MAI_CLAM44: 'MAI/CLAM (4,4)',
  FRAX_CLAM44: 'FRAX/CLAM (4,4)',
}
const bondToContract = {
  MAI44: bondContract_MAI44,
  FRAX44: bondContract_FRAX44,
  MAI_CLAM44: bondContract_MAI_CLAM44,
  FRAX_CLAM44: bondContract_FRAX_CLAM44,
}
const bondToMarketCoin = {
  MAI44: 'MAI',
  FRAX44: 'MAI',
  // FRAX44: 'FRAX',
  MAI_CLAM44: 'MAI',
  // FRAX_CLAM44: 'FRAX',
  FRAX_CLAM44: 'MAI',
}
const getRawBondPrice = async (bond) => {
  if (bondToContract[bond] === undefined)
    throw Error(`Contract type not supported: ${bond}`)
  return bondToContract[bond].bondPriceInUSD()
}
const getBondInfo = async (bondType) => {
  const title = bondTypeToTitle[bondType]
  const rawMarketPrice = await getRawMarketPrice(bondToMarketCoin[bondType])
  const rawBondPrice = await getRawBondPrice(bondType)
  const bondDiscount = (rawMarketPrice * 1e9 - rawBondPrice) / rawBondPrice
  return {
    title,
    price: Number(rawBondPrice / 1e18).toFixed(2),
    roi: Number(100 * bondDiscount).toFixed(2),
  }
}

const getBondFiveDayROI = async () => {
  const sClamCirc = (await sCLAM.circulatingSupply()) / 1e9
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
    (await circulatingSupply_CLAM.CLAMCirculatingSupply()) / 1e9,
  ).toFixed(0)
}

const getStakingTVL = async (rawPrice) => {
  const rawMarketPrice = rawPrice || (await getRawMarketPrice())
  const stakingBalance = await getRawStakingBalance()
  return Number((stakingBalance * rawMarketPrice) / 1e18).toFixed(0)
}

const getMarketCap = async (rawPrice) => {
  const rawMarketPrice = rawPrice || (await getRawMarketPrice())
  const circSupply = await circulatingSupply_CLAM.CLAMCirculatingSupply()
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
