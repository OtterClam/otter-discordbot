const { priceArrow } = require('./utils')
const { getPriceInfo } = require('./usecase')

let pastPriceBuf = 0
let pastArrow = ''
let count = 0

const priceSidebar = async () => {
  const pastPrice = pastPriceBuf
  const { price, tvl, marketCap, totalSupply } = await getPriceInfo({})
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
  console.log(`pricebot: ${pastPrice} ${arrow} ${price}, ${activity}`)
  count++

  return {
    title: `$${price} ${arrow}`,
    activity,
  }
}

module.exports = {
  priceSidebar,
}
