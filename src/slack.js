const axios = require('axios')

const sendBondCreated = async (url, { title, deposit, payout, price, total }) =>
  axios({
    url,
    method: 'post',
    headers: { 'content-type': 'application/json' },
    data: {
      attachments: [
        {
          color: '#cecda9',
          title,
          fields: [
            {
              title: 'Deposit',
              value: deposit,
              short: true,
            },
            {
              title: 'Payout',
              value: payout,
              short: true,
            },
            {
              title: 'Price',
              value: price,
              short: true,
            },
            {
              title: 'Total',
              value: total,
              short: true,
            },
          ],
        },
      ],
    },
  })

module.exports = {
  sendBondCreated,
}
