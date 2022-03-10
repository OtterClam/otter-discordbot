const { SlashCommandBuilder } = require('@discordjs/builders')
const { newClient, registerSlashCommand } = require('./discord')
const { newSheetsClient } = require('./google')

const ottolistedBot = async ({
  token,
  clientId,
  guildId,
  sheetEmail,
  sheetPriKey,
  sheetId,
}) => {
  const client = newClient()
  const sheet = await newSheetsClient({
    email: sheetEmail,
    priKey: sheetPriKey,
    sheetId: sheetId,
  })

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
  ]

  registerSlashCommand({ commands, token, clientId, guildId })

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName !== 'ottolisted') return

    const reply = m => interaction.editReply({ content: m, ephemeral: true })
    try {
      await interaction.deferReply({ ephemeral: true })

      const wallet = interaction.options.getString('wallet')
      if (!wallet.match(/^0x[0-9a-fA-F]{40}$/)) {
        await reply('Invalid wallet address.')
        return
      }
      const rolesSheet = sheet.sheetsByTitle['Roles']

      const roles = (await rolesSheet.getRows())?.map(r => r && r.Name) ?? []
      if (!interaction.member.roles.cache.some(r => roles.includes(r.name))) {
        await reply('You are not ottolisted!')
        return
      }

      const addressesSheet = sheet.sheetsByTitle['Addresses']
      const ids = (await addressesSheet.getRows())?.map(r => r && r.ID) ?? []
      if (ids.some(id => id === interaction.user.id)) {
        await reply(`Already submitted.`)
        return
      }
      await addressesSheet.addRow({
        ID: interaction.user.id,
        Name: interaction.user.tag,
        Wallet: wallet,
      })

      // update google google sheet
      await reply('Submitted!')
    } catch (err) {
      console.error(err)
      reply(`Unexpected error`).catch(console.error)
    }
  })

  return client.login(token)
}

module.exports = {
  ottolistedBot,
}
