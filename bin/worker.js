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
  bondContract_MAI44,
  bondContract_FRAX44,
  bondContract_MAI_CLAM44,
  bondContract_FRAX_CLAM44,
  pairContract_MAI_CLAM,
} = require('../src/contract')

const { priceSidebar } = require('../src/price')
const { bondSidebar } = require('../src/bond')
const { rebaseSidebar } = require('../src/rebase')

const { RESERVE_MAI_CLAM } = require('../src/constant')
const { sidebarBotFactory } = require('../src/sidebarBot')

const main = async () => {
  await Promise.all([
    sidebarBotFactory({
      token: DISCORD_PRICE_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: priceSidebar,
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_FRAX44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        'FRAX (4,4)',
        bondContract_FRAX44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_MAI44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        'MAI (4,4)',
        bondContract_MAI44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_MAI_CLAM44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        'MAI/CLAM (4,4)',
        bondContract_MAI_CLAM44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_FRAX_CLAM44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        'FRAX/CLAM (4,4)',
        bondContract_FRAX_CLAM44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_REBASE_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: rebaseSidebar,
    })(),
  ])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
