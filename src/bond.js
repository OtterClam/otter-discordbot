const { getBondInfo } = require('./usecase')

const bondSidebar =
  (title, bondContract, pairContract, assetAddress) => async () => {
    try {
      const { roi, price } = await getBondInfo(
        bondContract,
        pairContract,
        assetAddress,
      )
      const activity = `$${price} ROI: ${roi}%`
      console.log(`${title}: ${activity}`)
      return { title, activity }
    } catch (e) {
      console.error(e)
      return {
        title: 'Upcoming...',
        activity: '$0 ROI: 0%',
      }
    }
  }

module.exports = {
  bondSidebar,
}
