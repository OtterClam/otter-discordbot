require('dotenv').config()
const { DISCORD_PRICE_BOT_TOKEN, UPDATE_INTERVAL } = process.env
const { commaPrice, priceArrow } = require('../src/utils')
const { getMarketPrice, getStakingTVL, getRawMarketPrice, getMarketCap, getTotalSupply } = require('../src/fetcher')
const { sidebarFactory } = require('../src/sidebar')

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
    console.log(`${pastPrice} ${arrow} ${price}, ${activity}`)
    count++

    return {
      title: `$${price} ${arrow}`,
      activity,
    }
  },
})

pricebot()
