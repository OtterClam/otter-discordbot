const { priceArrow } = require('./utils')
const { getPriceInfo, getPearlPriceInfo } = require('./usecase')

let pastPriceBuf = 0
let pastArrow = ''
let count = 0

const priceSidebar = async () => {
  const pastPrice = pastPriceBuf
  const { price, tvl, marketCap, totalSupply } = await getPriceInfo()
  pastPriceBuf = price

  const arrow = priceArrow(price, pastPrice, pastArrow)
  pastArrow = arrow

  let activity
  if (count % 3 == 0) {
    activity = `TVL: $${tvl}`
  } else if (count % 3 == 1) {
    activity = `MarketCap: $${marketCap}`
  } else {
    activity = `CircSupply: ${totalSupply}`
  }
  console.log(`price: ${pastPrice} ${arrow} ${price}, ${activity}`)
  count++

  return {
    title: `$${price} ${arrow}`,
    activity,
  }
}

let pastPearlPriceBuf = 0
let pastPearlArrow = ''
const pearlPriceSidebar = async () => {
  const pastPrice = pastPearlPriceBuf
  const { price, currentIndex } = await getPearlPriceInfo()
  pastPearlPriceBuf = price

  const arrow = priceArrow(price, pastPrice, pastPearlArrow)
  pastPearlArrow = arrow

  const activity = `index: ${currentIndex}`

  console.log(`pearl price: ${pastPrice} ${arrow} ${price}, ${activity}`)
  return { title: `$${price} ${arrow}`, activity }
}

module.exports = {
  priceSidebar,
  pearlPriceSidebar,
}
