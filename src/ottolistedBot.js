const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { newClient } = require('./client')

const register = ({ commands, token, clientId, guildId }) => {
  new REST({ version: '9' })
    .setToken(token)
    .put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)
}
const wait = require('node:timers/promises').setTimeout

const ottolistedBotFactory = ({ token, clientId, guildId }) => {
  const client = newClient()

  const commands = [
    new SlashCommandBuilder()
      .setName('ottolisted')
      .setDescription('collect ottolisted information')
      .addStringOption(option =>
        option
          .setName('wallet')
          .setRequired(true)
          .setDescription('wallet address'),
      ),
  ].map(command => command.toJSON())

  register({ commands, token, clientId, guildId })

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName !== 'ottolisted') return

    await interaction.deferReply({ ephemeral: true })
    const reply = m => interaction.editReply({ content: m, ephemeral: true })

    const wallet = interaction.options.getString('wallet')
    if (!wallet.match(/^0x[0-9a-fA-F]{40}$/)) {
      await reply(`${wallet} is not a valid wallet address.`)
      return
    }

    if (!interaction.member.roles.cache.some(r => r.name === 'ottolisted')) {
      await reply('You are not in ottolisted!')
      return
    }

    // update google google sheet
    await wait(1000)
    await reply('Pong!')
  })

  return () => client.login(token)
}

module.exports = {
  ottolistedBotFactory,
}
