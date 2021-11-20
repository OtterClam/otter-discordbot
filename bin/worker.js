require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_BOND_MAI_CLAM_BOT_TOKEN,
  DISCORD_BOND_MAI_BOT_TOKEN,
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
} = require('../src/fetcher')
const { sidebarFactory } = require('../src/sidebar')
const { commaPrice, priceArrow, prettifySeconds } = require('../src/utils')

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
  const title = bondType === 'MAI' ? 'Bond MAI' : 'Bond CLAM/MAI'
  try {
    const rawBondPrice = await getRawBondPrice(bondType)
    const price = Number(rawBondPrice / 1e18).toFixed(2)
    const roi = await getBondROI(process.argv[2], rawBondPrice)
    const activity = `$${price} ROI: ${roi}%`
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

const bondbotMAI = sidebarFactory({
  token: DISCORD_BOND_MAI_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeRebaseSidebar('MAI'),
})
const bondbotMAI_CLAM = sidebarFactory({
  token: DISCORD_BOND_MAI_CLAM_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeRebaseSidebar('MAI_CLAM'),
})

const rebasebot = sidebarFactory({
  token: DISCORD_REBASE_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { epoch, currentBlockTime, currentEndTime } = await getEpoch()

    const nextRebaseIn = prettifySeconds(currentEndTime - currentBlockTime)
    const t = new Date(currentBlockTime * 1000)
    const clock = t.getUTCHours() + ':' + t.getUTCMinutes()
    console.log(`rebasebot: ${epoch} ${nextRebaseIn} @ ${clock} UTC`)

    return {
      title: `Harvest In: ${nextRebaseIn}`,
      activity: `Epoch: ${epoch} @ ${clock} UTC`,
    }
  },
})

const main = async () => {
  await Promise.all([pricebot(), bondbotMAI(), bondbotMAI_CLAM(), rebasebot()])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})