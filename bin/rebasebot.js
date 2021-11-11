require('dotenv').config()
const { DISCORD_REBASE_BOT_TOKEN, UPDATE_INTERVAL } = process.env
const { getEpoch } = require('../src/fetcher')
const { prettifySeconds } = require('../src/utils')
const { sidebarFactory } = require('../src/sidebar')

const rebasebot = sidebarFactory({
  token: DISCORD_REBASE_BOT_TOKEN,
  interval: UPDATE_INTERVAL,
  setSidebar: async () => {
    const { epoch, currentBlockTime, currentEndTime } = await getEpoch()

    const nextRebaseIn = prettifySeconds(currentEndTime - currentBlockTime)
    const t = new Date(currentBlockTime * 1000)
    const clock = t.getUTCHours() + ':' + t.getUTCMinutes()
    console.log(`${epoch} ${nextRebaseIn} @ ${clock} UTC`)

    return {
      title: `Harvest In: ${nextRebaseIn}`,
      activity: `Epoch: ${epoch} @ ${clock} UTC`,
    }
  },
})

rebasebot()
