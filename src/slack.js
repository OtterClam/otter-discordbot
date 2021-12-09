const axios = require('axios')

const sendBondCreated = async (
  url,
  { title, title_link, deposit, payout, price, total },
) =>
  axios({
    url,
    method: 'post',
    headers: { 'content-type': 'application/json' },
    data: {
      attachments: [
        {
          color: '#cecda9',
          title,
          title_link,
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
