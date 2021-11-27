const {
  utcClock,
  prettifySeconds,
  priceArrow,
  commaPrice,
} = require('./utils.js')

describe('commaPrice', () => {
  it.each([
    { n: 1, expected: '1' },
    { n: 100, expected: '100' },
    { n: 1000, expected: '1,000' },
    { n: 1000000, expected: '1,000,000' },
    { n: 1000000000, expected: '1,000,000,000' },
    { n: 1000000000.999, expected: '1,000,000,000.999' },
  ])('$n -> $expected', ({ n, expected }) => {
    expect(commaPrice(n)).toBe(expected)
  })
})

describe('priceArrow', () => {
  it.each([
    { price: 0, pastPrice: 100, pastArrow: '(↗)', expected: '(↘)' },
    { price: 0, pastPrice: 100, pastArrow: '(↘)', expected: '(↘)' },
    { price: 100, pastPrice: 0, pastArrow: '(↗)', expected: '(↗)' },
    { price: 100, pastPrice: 0, pastArrow: '(↘)', expected: '(↗)' },
    { price: 100, pastPrice: 100, pastArrow: '(↗)', expected: '(↗)' },
    { price: 100, pastPrice: 100, pastArrow: '(↘)', expected: '(↘)' },
  ])(
    '$pastArrow $pastPrice $expected $price',
    ({ price, pastPrice, pastArrow, expected }) => {
      expect(priceArrow(price, pastPrice, pastArrow)).toBe(expected)
    },
  )
})

describe('prettifySeconds', () => {
  it.each([
    { s: NaN, expected: '' },
    { s: 0, expected: '0m' },
    { s: 59, expected: '0m' },
    { s: 60, expected: '1m' },
    { s: 120, expected: '2m' },
    { s: 10 * 60, expected: '10m' },
    { s: 60 * 60, expected: '1h' },
    { s: 24 * 60 * 60, expected: '1d' },
    { s: 60 * 60 + 24 * 60 * 60, expected: '1d1h' },
    { s: 60 * 60 + 24 * 60 * 60, expected: '1d1h' },
    { s: 60 + 60 * 60 + 24 * 60 * 60, expected: '1d1h1m' },
  ])('$s -> $expected', ({ s, expected }) => {
    expect(prettifySeconds(s)).toBe(expected)
  })
})

describe('utcClock', () => {
  it.each([
    { t: new Date('2021-01-01T11:22:33Z'), expected: '11:22' },
    { t: new Date('2021-01-01T11:02:33Z'), expected: '11:02' },
    { t: new Date('2021-01-01T01:02:33Z'), expected: '1:02' },
  ])('$t -> $expected', ({ t, expected }) => {
    expect(utcClock(t)).toBe(expected)
  })
})
