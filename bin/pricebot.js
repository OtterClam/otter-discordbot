require('dotenv').config()
const { DISCORD_PRICE_BOT_TOKEN, UPDATE_INTERVAL } = process.env
const { commaPrice, priceArrow } = require('../src/utils')
const { getMarketPrice, getStakingTVL, getRawMarketPrice, getMarketCap, getTotalSupply } = require('../src/fetcher')

const { Client } = require('discord.js')

const bot = new Client()
let pastPriceBuf = 0
let pastArrow = ''
let count = 0
function updatePriceStatus() {
  const updatePriceAsync = async () => {
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
    count++
    console.log(`${pastPrice} ${arrow} ${price}, ${activity}`)

    await Promise.all([
      bot.user.setActivity(activity),
      bot.guilds.cache.map((guild) => guild.me.setNickname(`$${price} ${arrow}`)),
    ])
  }
  updatePriceAsync().catch(console.error)
}

// New server join event that causes the guild cache to refresh
bot.on('guildCreate', (guild) => {
  console.log(`New server has added the bot! Name: ${guild.name}`)
})

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)
  updatePriceStatus()
  setInterval(updatePriceStatus, UPDATE_INTERVAL)
})

bot.login(DISCORD_PRICE_BOT_TOKEN)
