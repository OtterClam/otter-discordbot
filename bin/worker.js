const { ethers } = require('ethers')
require('dotenv').config()
const {
  DISCORD_REBASE_BOT_TOKEN,
  DISCORD_PRICE_BOT_TOKEN,
  DISCORD_BOND_MAI44_BOT_TOKEN,
  DISCORD_BOND_FRAX44_BOT_TOKEN,
  DISCORD_BOND_MAI_CLAM44_BOT_TOKEN,
  DISCORD_BOND_MATIC44_BOT_TOKEN,
  DISCORD_BOND_FRAX_CLAM44_BOT_TOKEN,
  SLACK_WEBHOOK,
  UPDATE_INTERVAL,
} = process.env

const {
  bondContract_MAI44,
  bondContract_FRAX44,
  bondContract_MAI_CLAM44,
  bondContract_FRAX_CLAM44,
  bondContract_MATIC44,
  pairContract_MAI_CLAM,
} = require('../src/contract')

const { priceSidebar } = require('../src/price')
const { bondSidebar } = require('../src/bond')
const { rebaseSidebar } = require('../src/rebase')
const { sendBondCreated } = require('../src/slack')

const { RESERVE_MAI_CLAM } = require('../src/constant')
const { sidebarBotFactory } = require('../src/sidebarBot')

const mai44BondName = 'MAI (4,4)'
const frax44BondName = 'FRAX (4,4)'
const maiclam44BondName = 'MAI/CLAM (4,4)'
const fraxclam44BondName = 'FRAX/CLAM (4,4)'
const matic44BondName = 'WMATIC (4,4)'

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
        frax44BondName,
        bondContract_FRAX44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_MAI44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        mai44BondName,
        bondContract_MAI44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_MAI_CLAM44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        maiclam44BondName,
        bondContract_MAI_CLAM44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_FRAX_CLAM44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        fraxclam44BondName,
        bondContract_FRAX_CLAM44,
        pairContract_MAI_CLAM,
        RESERVE_MAI_CLAM,
      ),
    })(),
    sidebarBotFactory({
      token: DISCORD_BOND_MATIC44_BOT_TOKEN,
      interval: UPDATE_INTERVAL,
      sidebar: bondSidebar(
        matic44BondName,
        bondContract_MATIC44,
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

const priceFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'usd',
})
const notifyBondCreated =
  (name) =>
  async (deposit, payout, _, priceInUSD, ...rest) => {
    const txHash = rest[rest.length - 1].transactionHash
    const title = `New Bond ${name} created!`
    console.log(title)
    return sendBondCreated(SLACK_WEBHOOK, {
      title,
      title_link: `https://polygonscan.com/tx/${txHash}`,
      deposit: ethers.utils.formatEther(deposit),
      payout: ethers.utils.formatUnits(payout, 9),
      price: priceFormatter.format(ethers.utils.formatEther(priceInUSD)),
      total: priceFormatter.format(
        ethers.utils.formatEther(payout.mul(priceInUSD).div(1e9)),
      ),
    })
  }

bondContract_MAI44.on('BondCreated', notifyBondCreated(mai44BondName))
bondContract_FRAX44.on('BondCreated', notifyBondCreated(frax44BondName))
bondContract_MAI_CLAM44.on('BondCreated', notifyBondCreated(maiclam44BondName))
bondContract_FRAX_CLAM44.on(
  'BondCreated',
  notifyBondCreated(fraxclam44BondName),
)
bondContract_MATIC44.on('BondCreated', notifyBondCreated(matic44BondName))

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
