const { getBondInfo } = require('./usecase')

const bondSidebar =
  (title, bondContract, pairContract, assetAddress) => async () => {
    const { roi, price } = await getBondInfo(
      bondContract,
      pairContract,
      assetAddress,
    )
    const activity = `$${price} ROI: ${roi}%`
    console.log(`${title}: ${activity}`)
    return { title, activity }
  }

module.exports = {
  bondSidebar,
}
