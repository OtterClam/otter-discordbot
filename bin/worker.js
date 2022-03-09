require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_PRICE_PEARL_BOT_TOKEN,
  DISCORD_BOND_BOT_TOKEN,
  DISCORD_OTTERLISTED_BOT_TOKEN,
  DISCORD_OTTERLISTED_BOT_CLIENT_ID,
  DISCORD_OTTERLISTED_BOT_GUILD_ID,
  UPDATE_INTERVAL,
} = process.env

const { priceSidebar, pearlPriceSidebar } = require('../src/price')
const { bondSidebar } = require('../src/bond')
const { rebaseSidebar } = require('../src/rebase')

const { sidebarBotFactory } = require('../src/sidebarBot')
const { ottolistedBotFactory } = require('../src/ottolistedBot')

const main = async () => {
  await Promise.all([
    sidebarBotFactory({
      token: DISCORD_PRICE_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: priceSidebar,
    })(),
    sidebarBotFactory({
      token: DISCORD_PRICE_PEARL_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: pearlPriceSidebar,
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(),
    })(),
    sidebarBotFactory({
      token: DISCORD_REBASE_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: rebaseSidebar,
    })(),
    ottolistedBotFactory({
      clientId: DISCORD_OTTERLISTED_BOT_CLIENT_ID,
      token: DISCORD_OTTERLISTED_BOT_TOKEN,
      guildId: DISCORD_OTTERLISTED_BOT_GUILD_ID,
    })(),
  ])
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
