const { Client, Intents } = require('discord.js')

const newClient = () => new Client({ intents: [Intents.FLAGS.GUILDS] })

module.exports = {
  newClient,
}
