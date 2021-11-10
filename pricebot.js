require('dotenv').config()
const { DISCORD_PRICE_BOT_TOKEN, UPDATE_INTERVAL } = process.env
const { commaPrice, priceArrow } = require('./utils')
const { getRawMarketPrice, getRawStakingBalance } = require('./price')

const { Client } = require('discord.js')

const bot = new Client()
async function getPriceData() {
  const rawMarketPrice = await getRawMarketPrice()
  const marketPrice = Number((rawMarketPrice.toNumber() / Math.pow(10, 9)).toFixed(4))

  const stakingBalance = await getRawStakingBalance()
  const stakingTVL = ((stakingBalance * marketPrice) / Math.pow(10, 9)).toFixed(0)

  return {
    price: marketPrice,
    tvl: commaPrice(stakingTVL),
  }
}

let pastPriceBuf = 0
let pastArrow = ''
function updatePriceStatus() {
  const updatePriceAsync = async () => {
    const pastPrice = pastPriceBuf
    const { tvl, price } = await getPriceData()
    pastPriceBuf = price
    const arrow = priceArrow(price, pastPrice, pastArrow)
    pastArrow = arrow

    console.log(`${pastPrice} ${arrow} ${price}, TVL ${tvl}`)

    await bot.user.setActivity(`TVL: $${tvl}`, {
      type: 'WATCHING',
    })
    await Promise.all(
      bot.guilds.cache.map(async guild => {
        await guild.me.setNickname(`$${price} ${arrow}`)
      }),
    )
  }
  updatePriceAsync().catch(console.error)
}

// New server join event that causes the guild cache to refresh
bot.on('guildCreate', guild => {
  console.log(`New server has added the bot! Name: ${guild.name}`)
})

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)
  updatePriceStatus()
  setInterval(updatePriceStatus, UPDATE_INTERVAL)
})

bot.login(DISCORD_PRICE_BOT_TOKEN)
