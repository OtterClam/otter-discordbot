require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_BOND_MAI_CLAM_BOT_TOKEN,
  DISCORD_BOND_MAI44_BOT_TOKEN,
  DISCORD_BOND_FRAX44_BOT_TOKEN,
  UPDATE_INTERVAL,
} = process.env
const {
  getMarketPrice,
  getStakingTVL,
  getRawMarketPrice,
  getMarketCap,
  getTotalSupply,
  getRawBondPrice,
  getBondROI,
  getEpoch,
  getBondFiveDayROI,
} = require('../src/fetcher')
const { sidebarFactory } = require('../src/sidebar')
const {
  commaPrice,
  priceArrow,
  prettifySeconds,
  utcClock,
} = require('../src/utils')

let pastPriceBuf = 0
let pastArrow = ''
let count = 0
const pricebot = sidebarFactory({
  token: DISCORD_PRICE_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const pastPrice = pastPriceBuf
    const rawPrice = await getRawMarketPrice()
    const price = await getMarketPrice(rawPrice)
    pastPriceBuf = price

    const arrow = priceArrow(price, pastPrice, pastArrow)
    pastArrow = arrow

    let activity
    if (count % 3 == 0) {
      const tvl = commaPrice(await getStakingTVL(rawPrice))
      activity = `TVL: $${tvl}`
    } else if (count % 3 == 1) {
      const marketCap = commaPrice(await getMarketCap(rawPrice))
      activity = `MarketCap: $${marketCap}`
    } else {
      const TotalSupply = commaPrice(await getTotalSupply())
      activity = `TotalSupply: ${TotalSupply}`
    }
    console.log(`pricebot : ${pastPrice} ${arrow} ${price}, ${activity}`)
    count++

    return {
      title: `$${price} ${arrow}`,
      activity,
    }
  },
})

const makeRebaseSidebar = (bondType) => async () => {
  let title
  switch (bondType) {
    case 'MAI_CLAM':
      title = 'Bond MAI/CLAM'
      break
    case 'MAI44':
      title = 'Bond MAI (4,4)'
      break
    case 'FRAX44':
      title = 'Bond FRAX (4,4)'
      break
    default:
      throw Error(`bond type ${bondType} not supported`)
  }

  try {
    const rawBondPrice = await getRawBondPrice(bondType)
    const price = Number(rawBondPrice / 1e18).toFixed(2)
    const roi = await getBondROI(process.argv[2], rawBondPrice)
    let activity
    if (['MAI44', 'FRAX44'].includes(bondType)) {
      const fiveDayROI = await getBondFiveDayROI()
      const totalROI = (Number(roi) + Number(fiveDayROI)).toFixed(2)
      activity = `$${price} ROI: ${totalROI}%`
    } else {
      activity = `$${price} ROI: ${roi}%`
    }
    console.log(`bondbot  : ${activity} ${bondType}`)
    return {
      title,
      activity,
    }
  } catch (e) {
    const activity = `$0 ROI: $0%`
    console.log(`bondbot  : ${activity} ${bondType}`)
    return {
      title,
      activity,
    }
  }
}

const bondbotMAI_CLAM = sidebarFactory({
  token: DISCORD_BOND_MAI_CLAM_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeRebaseSidebar('MAI_CLAM'),
})
const bondbotFRAX44 = sidebarFactory({
  token: DISCORD_BOND_FRAX44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeRebaseSidebar('FRAX44'),
})
const bondbotMAI44 = sidebarFactory({
  token: DISCORD_BOND_MAI44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeRebaseSidebar('MAI44'),
})

const rebasebot = sidebarFactory({
  token: DISCORD_REBASE_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { epoch, currentBlockTime, currentEndTime } = await getEpoch()

    const nextRebaseIn = prettifySeconds(currentEndTime - currentBlockTime)
    const clock = utcClock(new Date(currentBlockTime * 1000))
    console.log(`rebasebot: ${epoch} ${nextRebaseIn} @ ${clock} UTC`)

    return {
      title: `Harvest In: ${nextRebaseIn}`,
      activity: `Epoch: ${epoch} @ ${clock} UTC`,
    }
  },
})

const main = async () => {
  await Promise.all([
    pricebot(),
    bondbotMAI_CLAM(),
    bondbotFRAX44(),
    bondbotMAI44(),
    rebasebot(),
  ])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
