require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_BOND_MAI44_BOT_TOKEN,
  DISCORD_BOND_FRAX44_BOT_TOKEN,
  DISCORD_BOND_MAI_CLAM44_BOT_TOKEN,
  DISCORD_BOND_FRAX_CLAM44_BOT_TOKEN,
  UPDATE_INTERVAL,
} = process.env
const {
  getMarketPrice,
  getStakingTVL,
  getRawMarketPrice,
  getMarketCap,
  getTotalSupply,
  getBondInfo,
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

const makeBondSidebar = (bondType) => async () => {
  let title,
    activity,
    err = ''
  try {
    const [info, fiveDayROI] = await Promise.all([
      getBondInfo(bondType),
      getBondFiveDayROI(),
    ])
    const totalROI = (Number(info.roi) + Number(fiveDayROI)).toFixed(2)
    title = info.title
    activity = `$${info.price} ROI: ${totalROI}%`
  } catch (e) {
    title = 'Upcoming ...'
    activity = `$0 ROI: 0%`
    err = `${e}`
  }
  console.log(`bondbot  : ${activity} ${bondType} ${err}`)
  return {
    title,
    activity,
  }
}

const bondbotFRAX44 = sidebarFactory({
  token: DISCORD_BOND_FRAX44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeBondSidebar('FRAX44'),
})
const bondbotMAI44 = sidebarFactory({
  token: DISCORD_BOND_MAI44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeBondSidebar('MAI44'),
})
const bondbotMAI_CLAM44 = sidebarFactory({
  token: DISCORD_BOND_MAI_CLAM44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeBondSidebar('MAI_CLAM44'),
})
const bondbotFRAX_CLAM44 = sidebarFactory({
  token: DISCORD_BOND_FRAX_CLAM44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: makeBondSidebar('FRAX_CLAM44'),
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
    bondbotFRAX44(),
    bondbotMAI44(),
    bondbotMAI_CLAM44(),
    bondbotFRAX_CLAM44(),
    rebasebot(),
  ])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
