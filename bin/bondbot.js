require('dotenv').config()
const { DISCORD_BOND_MAI_CLAM_BOT_TOKEN, DISCORD_BOND_MAI_BOT_TOKEN, UPDATE_INTERVAL } = process.env
const { getRawBondPrice, getBondROI } = require('../src/fetcher')
const { sidebarFactory } = require('../src/sidebar')

const setSidebar = async () => {
  const bondType = process.argv[2]
  const title = bondType === 'MAI' ? 'Bond MAI' : 'Bond CLAM/MAI'
  const rawBondPrice = await getRawBondPrice(bondType)
  const price = Number(rawBondPrice / 1e18).toFixed(2)
  const roi = await getBondROI(process.argv[2], rawBondPrice)
  const activity = `$${price} ROI: ${roi}%`
  console.log(activity)
  return {
    title,
    activity,
  }
}

let bondbot
if (process.argv[2] === 'MAI') {
  bondbot = sidebarFactory({
    token: DISCORD_BOND_MAI_BOT_TOKEN,
    interval: UPDATE_INTERVAL,
    setSidebar,
  })
} else if (process.argv[2] === 'MAI_CLAM') {
  bondbot = sidebarFactory({
    token: DISCORD_BOND_MAI_CLAM_BOT_TOKEN,
    interval: UPDATE_INTERVAL,
    setSidebar,
  })
} else {
  throw new Error('should input MAI or MAI_CLAM')
}
bondbot()
