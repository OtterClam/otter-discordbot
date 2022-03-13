const { SlashCommandBuilder } = require('@discordjs/builders')
const { newClient, registerSlashCommand, Intents } = require('./discord')
const { newSheetsClient } = require('./google')

const ottolistedBot = async ({
  token,
  clientId,
  guildId,
  sheetEmail,
  sheetPriKey,
  sheetId,
}) => {
  const client = newClient([Intents.FLAGS.GUILD_MEMBERS])
  const sheet = await newSheetsClient({
    email: sheetEmail,
    priKey: sheetPriKey,
    sheetId: sheetId,
  })

  const commands = [
    new SlashCommandBuilder()
      .setName('ottolisted')
      .setDescription('ottolisted command')
      .addSubcommand(subcommand =>
        subcommand
          .setName('submit')
          .setDescription('submit wallet address')
          .addStringOption(option =>
            option
              .setName('wallet')
              .setRequired(true)
              .setDescription('wallet address'),
          ),
      )
      .addSubcommand(subcommand =>
        subcommand.setName('info').setDescription('ottolisted info'),
      ),
  ]

  registerSlashCommand({ commands, token, clientId, guildId })

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })

  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      const [before, after] = await Promise.all([
        ottolisted({ sheet, member: oldMember }),
        ottolisted({ sheet, member: newMember }),
      ])

      const addressesSheet = sheet.sheetsByTitle['Addresses']
      if (before && !after) {
        const rows = (await addressesSheet.getRows()) ?? []
        rows
          .filter(r => r && r.ID === oldMember.id)
          .forEach(r => {
            r.Disqualified = '*'
            r.save().catch(console.error)
            console.log(`${oldMember.user.tag} unqualified`)
          })
      } else if (!before && after) {
        const rows = (await addressesSheet.getRows()) ?? []
        rows
          .filter(r => r && r.ID === oldMember.id)
          .forEach(r => {
            r.Disqualified = ''
            r.save().catch(console.error)
            console.log(`${newMember.user.tag} qualified back`)
          })
      }
    } catch (err) {
      console.error(err)
    }
  })

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName !== 'ottolisted') return

    const reply = m => interaction.editReply({ content: m, ephemeral: true })

    try {
      await interaction.deferReply({ ephemeral: true })
      if (!(await ottolisted({ sheet, member: interaction.member }))) {
        await reply('You are not ottolisted!')
        return
      }

      if (interaction.options.getSubcommand() === 'submit') {
        await submit({ sheet, interaction, reply })
      } else if (interaction.options.getSubcommand() === 'info') {
        await info({ sheet, interaction, reply })
      } else {
        await reply('Invalid command.')
      }
    } catch (err) {
      console.error(err)
      reply(`Unexpected error`).catch(console.error)
    }
  })

  return client.login(token)
}

const ottolisted = async ({ sheet, member }) => {
  const rolesSheet = sheet.sheetsByTitle['Roles']
  const roles = (await rolesSheet.getRows())?.map(r => r && r.Name) ?? []
  return member.roles.cache.some(r => roles.includes(r.name))
}

const info = async ({ sheet, interaction, reply }) => {
  const addressesSheet = sheet.sheetsByTitle['Addresses']
  const wallet =
    (await addressesSheet.getRows())
      ?.filter(r => r && r.ID === interaction.user.id)
      ?.map(r => r.Wallet) ?? []
  if (wallet.length !== 0) {
    await reply(`Your wallet address is ${wallet[0]}`)
  } else {
    await reply('Not submitted yet.')
  }
}

const submit = async ({ sheet, interaction, reply }) => {
  const wallet = interaction.options.getString('wallet')
  if (!wallet.match(/^0x[0-9a-fA-F]{40}$/)) {
    await reply('Invalid wallet address.')
    return
  }
  const addressesSheet = sheet.sheetsByTitle['Addresses']
  const rows = (await addressesSheet.getRows()) ?? []
  const existsRow = rows.filter(r => r && r.ID === interaction.user.id)
  if (existsRow.length > 0) {
    existsRow[0].Wallet = wallet
    await existsRow[0].save()
    await reply(`${wallet} resubmitted.`)
    return
  } else {
    await addressesSheet.addRow({
      ID: interaction.user.id,
      Name: interaction.user.tag,
      Wallet: wallet,
    })
    await reply('${wallet} submitted!')
  }
}

module.exports = {
  ottolistedBot,
}
