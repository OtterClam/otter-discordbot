const { BigNumber } = require('ethers')
const {
  provider,
  pairContract_MAI_CLAM,
  stakingContract,
  sCLAM,
  circulatingSupply_CLAM,
} = require('./contract')

const { CLAM_ADDRESS, RESERVE_MAI_CLAM } = require('./constant')
const { commaNumber } = require('../src/utils')

const getTotalSupply = async () => {
  return Number(
    (await circulatingSupply_CLAM.CLAMCirculatingSupply()) / 1e9,
  ).toFixed(0)
}

const getRawMarketPrice = async (
  { pairContract, assetAddress } = {
    pairContract: pairContract_MAI_CLAM,
    assetAddress: RESERVE_MAI_CLAM,
  },
) => {
  if (pairContract === undefined || assetAddress === undefined)
    throw Error(
      `pairContract(${pairContract}) or address(${assetAddress}) invalid`,
    )

  const reserves = await pairContract.getReserves()
  const [p0, p1] = BigNumber.from(assetAddress).gt(CLAM_ADDRESS)
    ? [reserves[0], reserves[1]]
    : [reserves[1], reserves[0]]
  const marketPrice = p1.div(p0)
  return marketPrice
}

const getPriceInfo = async () => {
  const [rawMarketPrice, stakingBalance, circSupply, totalSupply] =
    await Promise.all([
      getRawMarketPrice(),
      stakingContract.contractBalance(),
      circulatingSupply_CLAM.CLAMCirculatingSupply(),
      getTotalSupply(),
    ])
  return {
    price: Number((rawMarketPrice.toNumber() / 1e9).toFixed(4)),
    tvl: commaNumber(
      Number((stakingBalance * rawMarketPrice) / 1e18).toFixed(0),
    ),
    marketCap: commaNumber(
      Number((circSupply * rawMarketPrice) / 1e18).toFixed(0),
    ),
    totalSupply: commaNumber(totalSupply),
  }
}

const getRawBondPrice = async ({ bondContract }) => {
  return bondContract.bondPriceInUSD()
}
const getBondFiveDayRate = async () => {
  const sClamCirc = (await sCLAM.circulatingSupply()) / 1e9
  const epoch = await stakingContract.epoch()
  const stakingReward = epoch.distribute / 1e9
  const stakingRebase = stakingReward / sClamCirc
  const fiveDayDiscount = Math.pow(1 + stakingRebase, 5 * 3) - 1
  return fiveDayDiscount
}
const getBondInfo = async ({ pairContract, bondContract, assetAddress }) => {
  const [rawMarketPrice, rawBondPrice, fiveDayRate] = await Promise.all([
    getRawMarketPrice({ pairContract, assetAddress }),
    getRawBondPrice({ bondContract }),
    getBondFiveDayRate(),
  ])
  const price = Number(rawBondPrice / 1e18).toFixed(2)
  const bondDiscount = (rawMarketPrice * 1e9 - rawBondPrice) / rawBondPrice
  const roi = Number(100 * (bondDiscount + fiveDayRate)).toFixed(2)
  return {
    price,
    roi,
  }
}

const getRebaseInfo = async () => {
  const { number, endTime } = await stakingContract.epoch()
  const currentBlock = await provider.getBlockNumber()
  const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp
  return {
    epoch: number.toNumber(),
    currentBlockTime,
    currentEndTime: endTime.toNumber(),
  }
}

module.exports = {
  getRebaseInfo,
  getTotalSupply,
  getBondInfo,
  getPriceInfo,
}
