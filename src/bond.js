const { ethers } = require('ethers')
const { getBondInfo } = require('./usecase')
const { RESERVE_MAI_CLAM } = require('./constant')
const { sendBondCreated } = require('./slack')
require('path')

const {
  bondContract_MAI44,
  bondContract_FRAX44,
  bondContract_MAI_CLAM44,
  bondContract_FRAX_CLAM44,
  bondContract_WMATIC44,
  bondContract_WMATIC_CLAM44,
  pairContract_MAI_CLAM,
} = require('./contract')

const { SLACK_WEBHOOK } = process.env

let currPrice = 0
let currROI = 0
let currIndex = 0

const mai44BondName = 'MAI (4,4)'
const frax44BondName = 'FRAX (4,4)'
const maiclam44BondName = 'MAI/CLAM (4,4)'
const fraxclam44BondName = 'FRAX/CLAM (4,4)'
const wmatic44BondName = 'WMATIC (4,4)'
const wmaticclam44BondName = 'WMATIC/CLAM (4,4)'

const bonds = [
  {
    name: mai44BondName,
    contract: bondContract_MAI44,
    image: __dirname + '/avatars/mai.png',
  },
  {
    name: frax44BondName,
    contract: bondContract_FRAX44,
    image: __dirname + '/avatars/frax.png',
  },
  {
    name: maiclam44BondName,
    contract: bondContract_MAI_CLAM44,
    image: __dirname + '/avatars/mai_clam_lp.png',
  },
  {
    name: fraxclam44BondName,
    contract: bondContract_FRAX_CLAM44,
    image: __dirname + '/avatars/frax_clam_lp.png',
  },
  {
    name: wmatic44BondName,
    contract: bondContract_WMATIC44,
    image: __dirname + '/avatars/wmatic.png',
  },
  {
    name: wmaticclam44BondName,
    contract: bondContract_WMATIC_CLAM44,
    image: __dirname + '/avatars/wmatic_clam_lp.png',
  },
]

const bondSidebar = () => async () => {
  const infos = await Promise.allSettled(
    bonds.map(async bond =>
      getBondInfo(bond.contract, pairContract_MAI_CLAM, RESERVE_MAI_CLAM),
    ),
  )

  infos.forEach((info, i) => {
    if (info.status == 'fulfilled') {
      const { price, roi } = info.value
      if (currPrice == 0 || Number(price) < currPrice) {
        currPrice = Number(price)
        currROI = roi
        currIndex = i
      }
    }
  })
  const title = bonds[currIndex].name
  const activity = `$${currPrice} ROI: ${currROI}%`
  const image = bonds[currIndex].image
  console.log(`${title} ${activity} ${image}`)
  return {
    title,
    activity,
    image,
  }
}

const priceFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'usd',
})
const notifyBondCreated = name => async (
  deposit,
  payout,
  _,
  priceInUSD,
  ...rest
) => {
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
bondContract_WMATIC44.on('BondCreated', notifyBondCreated(wmatic44BondName))
bondContract_WMATIC_CLAM44.on(
  'BondCreated',
  notifyBondCreated(wmaticclam44BondName),
)

module.exports = {
  bondSidebar,
}
