require('dotenv').config()
const { getCirculatingSupply, getPearlTotalSupply } = require('../src/usecase')

const express = require('express')
const app = express()
const port = process.env['PORT']

const asyncWrapper =
  (fn) =>
  (...args) =>
    fn(...args).catch(args[2])

app.get(
  '/otterclamerc20v2/:key',
  asyncWrapper(async (req, res) => {
    const key = req.params.key
    const allowedValues = {
      circulating_supply: getCirculatingSupply,
      total_supply: getCirculatingSupply,
    }
    if (!Object.keys(allowedValues).includes(key)) {
      return res.status(400).send()
    }

    const f = allowedValues[key]
    const ret = await f()
    res.set('content-type', 'text/plain')
    return res.send(`${ret}`)
  }),
)

app.get(
  '/otterpearl/erc20/:key',
  asyncWrapper(async (req, res) => {
    const key = req.params.key
    const allowedValues = {
      total_supply: getPearlTotalSupply,
    }
    if (!Object.keys(allowedValues).includes(key)) {
      return res.status(400).send()
    }

    const f = allowedValues[key]
    const ret = await f()
    res.set('content-type', 'text/plain')
    return res.send(`${ret}`)
  }),
)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
