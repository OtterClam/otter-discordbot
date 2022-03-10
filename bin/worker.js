require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_PRICE_PEARL_BOT_TOKEN,
  DISCORD_BOND_BOT_TOKEN,
  DISCORD_OTTOLISTED_BOT_TOKEN,
  DISCORD_OTTOLISTED_BOT_CLIENT_ID,
  DISCORD_OTTOLISTED_BOT_GUILD_ID,
  GOOGLE_OTTOLISTED_SHEET_ID,
  GOOGLE_OTTOLISTED_PRIVATE_KEY,
  GOOGLE_OTTOLISTED_CLIENT_EMAIL,
  UPDATE_INTERVAL,
} = process.env

const { priceSidebar, pearlPriceSidebar } = require('../src/price')
const { bondSidebar } = require('../src/bond')
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
      token: DISCORD_BOND_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(),
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
      sheetEmail: GOOGLE_OTTOLISTED_CLIENT_EMAIL,
      sheetPriKey: GOOGLE_OTTOLISTED_PRIVATE_KEY,
      sheetId: GOOGLE_OTTOLISTED_SHEET_ID,
    }),
  ])
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
