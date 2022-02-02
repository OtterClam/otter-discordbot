require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_PRICE_PEARL_BOT_TOKEN,
  DISCORD_BOND_BOT_TOKEN,
  UPDATE_INTERVAL,
} = process.env

const { priceSidebar, pearlPriceSidebar } = require('../src/price')
const { bondSidebar } = require('../src/bond')
const { rebaseSidebar } = require('../src/rebase')

const { sidebarBotFactory } = require('../src/sidebarBot')

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
  ])
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
