const { newClient } = require('./discord')

const sidebarBot = ({ token, interval, sidebar }) => {
  const client = newClient()

  const loop = () => {
    const loopAsync = async () => {
      const { title, activity, image } = await sidebar()
      const actions = [
        client.user.setActivity(activity),
        client.guilds.cache.map(guild => guild.me.setNickname(title)),
      ]
      if (image) {
        actions.push(client.user.setAvatar(image))
      }
      await Promise.all(actions)
    }
    loopAsync().catch(console.error)
  }

  client.on('guildCreate', guild => {
    console.log(`New server has added the bot! Name: ${guild.name}`)
  })
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    loop()
    setInterval(loop, interval)
  })

  return client.login(token)
}

module.exports = {
  sidebarBot,
}
