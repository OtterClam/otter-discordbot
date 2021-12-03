const axios = require('axios')

const sendAttachment = async (url, opts) => {
  const { title, title_link, fields } = opts
  axios({
    url,
    method: 'post',
    headers: { 'content-type': 'application/json' },
    data: {
      attachments: [
        {
          title,
          title_link,
          fields,
        },
      ],
    },
  })
}

module.exports = {
  sendAttachment,
}
