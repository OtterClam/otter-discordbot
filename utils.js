const commaPrice = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const priceArrow = (price, pastPrice) => {
  return price === pastPrice ? '(→)' : price > pastPrice ? '(↗)' : '(↘)'
}

const prettifySeconds = seconds => {
  if (seconds !== 0 && !seconds) {
    return ''
  }

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)

  const dDisplay = d > 0 ? d + 'd' : ''
  const hDisplay = h > 0 ? h + 'h' : ''
  const mDisplay = m > 0 ? m + 'm' : ''

  return dDisplay + hDisplay + mDisplay
}

module.exports = {
  commaPrice,
  priceArrow,
  prettifySeconds,
}
