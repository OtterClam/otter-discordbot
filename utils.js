const commaPrice = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const priceArrow = (price, pastPrice) => {
  return price === pastPrice ? "(→)" : price > pastPrice ? "(↗)" : "(↘)";
};

module.exports = {
  commaPrice,
  priceArrow,
};
