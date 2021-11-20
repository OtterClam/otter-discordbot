require('dotenv').config()
const { getTotalSupply } = require('../src/fetcher')

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
    const allowedValues = { total_supply: getTotalSupply }
    if (!Object.keys(allowedValues).includes(key)) {
      return res.status(400).send()
    }

    const f = allowedValues[key]
    const ret = await f()
    return res.send(`${ret}`)
  }),
)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
