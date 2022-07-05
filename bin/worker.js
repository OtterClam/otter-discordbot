require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_PRICE_PEARL_BOT_TOKEN,
  DISCORD_BOND_BOT_TOKEN,
  DISCORD_OTTOLISTED_BOT_TOKEN,
  DISCORD_OTTOLISTED_BOT_CLIENT_ID,
  DISCORD_OTTOLISTED_BOT_GUILD_ID,
  UPDATE_INTERVAL,
} = process.env

const { priceSidebar, pearlPriceSidebar } = require('../src/price')
const { rebaseSidebar } = require('../src/rebase')

const { sidebarBot } = require('../src/sidebarBot')
const { ottolistedBot } = require('../src/ottolistedBot')

const main = async () => {
  await Promise.all([
    sidebarBot({
      token: DISCORD_PRICE_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: priceSidebar,
    }),
    sidebarBot({
      token: DISCORD_PRICE_PEARL_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: pearlPriceSidebar,
    }),
    sidebarBot({
      token: DISCORD_REBASE_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: rebaseSidebar,
    }),
    ottolistedBot({
      clientId: DISCORD_OTTOLISTED_BOT_CLIENT_ID,
      token: DISCORD_OTTOLISTED_BOT_TOKEN,
      guildId: DISCORD_OTTOLISTED_BOT_GUILD_ID,
    }),
  ])
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
