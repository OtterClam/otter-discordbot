const axios = require('axios')

const sendBondCreated = async (url, { title, deposit, payout, price, total }) =>
  axios({
    url,
    method: 'post',
    headers: { 'content-type': 'application/json' },
    data: {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: title,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Deposit*\n${deposit}`,
            },
            {
              type: 'mrkdwn',
              text: `*Payout*\n${payout} CLAM`,
            },
            {
              type: 'mrkdwn',
              text: `*Price*\n$${price}`,
            },
            {
              type: 'mrkdwn',
              text: `*Total*\n$${total}`,
            },
          ],
        },
        // {
        //   type: 'divider',
        // },
        // {
        //   type: 'section',
        //   fields: [
        //     {
        //       type: 'mrkdwn',
        //       text: '*Market Price*\n$110.5*',
        //     },
        //     {
        //       type: 'mrkdwn',
        //       text: '*Debt Ratio*\n45.23%',
        //     },
        //     {
        //       type: 'mrkdwn',
        //       text: '*BCV*\n100',
        //     },
        //     {
        //       type: 'mrkdwn',
        //       text: '*ROI*\n5%',
        //     },
        //   ],
        // },
      ],
    },
  })

module.exports = {
  sendBondCreated,
}
