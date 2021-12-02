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
const { getBondInfo, getRebaseInfo, getPriceInfo } = require('../src/usecase')

const {
  bondContract_MAI44,
  bondContract_FRAX44,
  bondContract_MAI_CLAM44,
  bondContract_FRAX_CLAM44,
  pairContract_MAI_CLAM,
} = require('../src/contract')

const { RESERVE_MAI_CLAM } = require('../src/constant')
const { sidebarFactory } = require('../src/sidebar')
const { priceArrow, prettifySeconds, utcClock } = require('../src/utils')

let pastPriceBuf = 0
let pastArrow = ''
let count = 0
const pricebot = sidebarFactory({
  token: DISCORD_PRICE_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const pastPrice = pastPriceBuf
    const { price, tvl, marketCap, totalSupply } = await getPriceInfo({})
    pastPriceBuf = price

    const arrow = priceArrow(price, pastPrice, pastArrow)
    pastArrow = arrow

    let activity
    if (count % 3 == 0) {
      activity = `TVL: $${tvl}`
    } else if (count % 3 == 1) {
      activity = `MarketCap: $${marketCap}`
    } else {
      activity = `CircSupply: ${totalSupply}`
    }
    console.log(`pricebot : ${pastPrice} ${arrow} ${price}, ${activity}`)
    count++

    return {
      title: `$${price} ${arrow}`,
      activity,
    }
  },
})

const bondbot_FRAX44 = sidebarFactory({
  token: DISCORD_BOND_FRAX44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { roi, price } = await getBondInfo({
      bondContract: bondContract_FRAX44,
      pairContract: pairContract_MAI_CLAM,
      assetAddress: RESERVE_MAI_CLAM,
    })
    const title = 'FRAX (4,4)'
    const activity = `$${price} ROI: ${roi}%`
    console.log(`frax     : ${activity}`)
    return { title, activity }
  },
})
const bondbot_MAI44 = sidebarFactory({
  token: DISCORD_BOND_MAI44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { roi, price } = await getBondInfo({
      bondContract: bondContract_MAI44,
      pairContract: pairContract_MAI_CLAM,
      assetAddress: RESERVE_MAI_CLAM,
    })
    const title = 'MAI (4,4)'
    const activity = `$${price} ROI: ${roi}%`
    console.log(`mai      : ${activity}`)
    return { title, activity }
  },
})
const bondbot_MAI_CLAM44 = sidebarFactory({
  token: DISCORD_BOND_MAI_CLAM44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { roi, price } = await getBondInfo({
      bondContract: bondContract_MAI_CLAM44,
      pairContract: pairContract_MAI_CLAM,
      assetAddress: RESERVE_MAI_CLAM,
    })
    const title = 'MAI/CLAM (4,4)'
    const activity = `$${price} ROI: ${roi}%`
    console.log(`mai/clam : ${activity}`)
    return { title, activity }
  },
})
const bondbot_FRAX_CLAM44 = sidebarFactory({
  token: DISCORD_BOND_FRAX_CLAM44_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { roi, price } = await getBondInfo({
      bondContract: bondContract_FRAX_CLAM44,
      pairContract: pairContract_MAI_CLAM,
      assetAddress: RESERVE_MAI_CLAM,
    })
    const title = 'FRAX/CLAM (4,4)'
    const activity = `$${price} ROI: ${roi}%`
    console.log(`frax/clam: ${activity}`)
    return { title, activity }
  },
})

const rebasebot = sidebarFactory({
  token: DISCORD_REBASE_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { epoch, currentBlockTime, currentEndTime } = await getRebaseInfo()

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
    bondbot_FRAX44(),
    bondbot_MAI44(),
    bondbot_MAI_CLAM44(),
    bondbot_FRAX_CLAM44(),
    rebasebot(),
  ])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
