const { Client, Intents } = require('discord.js')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const newClient = (additionalIntents = []) =>
  new Client({ intents: [Intents.FLAGS.GUILDS, ...additionalIntents] })

const registerSlashCommand = ({ commands, token, clientId, guildId }) => {
  new REST({ version: '9' })
    .setToken(token)
    .put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map(c => c.toJSON()),
    })
    .then(() =>
      console.log(`/${commands.map(c => c.name)} commands registered.`),
    )
    .catch(console.error)
}
module.exports = {
  newClient,
  registerSlashCommand,
  Intents,
}
