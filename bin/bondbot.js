require('dotenv').config()
const { DISCORD_BOND_MAI_CLAM_BOT_TOKEN, DISCORD_BOND_MAI_BOT_TOKEN, UPDATE_INTERVAL } = process.env
const { getRawBondPrice, getBondROI } = require('../src/fetcher')

const { Client } = require('discord.js')

const bot = new Client()

function updateBondStatus() {
  const updatePriceAsync = async () => {
    const bondType = process.argv[2]
    const bondName = bondType === 'MAI' ? 'Bond MAI' : 'Bond CLAM/MAI'
    const rawBondPrice = await getRawBondPrice(bondType)
    const price = Number(rawBondPrice / 1e18).toFixed(2)
    const roi = await getBondROI(process.argv[2], rawBondPrice)
    const activity = `$${price} ROI: ${roi}%`
    console.log(activity)

    await Promise.all([
      bot.user.setActivity(activity),
      bot.guilds.cache.map((guild) => guild.me.setNickname(`${bondName}`)),
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
  updateBondStatus()
  setInterval(updateBondStatus, UPDATE_INTERVAL)
})

if (process.argv[2] === 'MAI') {
  bot.login(DISCORD_BOND_MAI_BOT_TOKEN)
} else if (process.argv[2] === 'MAI_CLAM') {
  bot.login(DISCORD_BOND_MAI_CLAM_BOT_TOKEN)
} else {
  throw new Error('should input MAI or MAI_CLAM')
}
