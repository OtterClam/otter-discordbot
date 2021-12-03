const { prettifySeconds, utcClock } = require('./utils')
const { getRebaseInfo } = require('./usecase')

const rebaseSidebar = async () => {
  const { epoch, currentBlockTime, currentEndTime } = await getRebaseInfo()

  const nextRebaseIn = prettifySeconds(currentEndTime - currentBlockTime)
  const clock = utcClock(new Date(currentBlockTime * 1000))
  console.log(`rebasebot: ${epoch} ${nextRebaseIn} @ ${clock} UTC`)

  return {
    title: `Harvest In: ${nextRebaseIn}`,
    activity: `Epoch: ${epoch} @ ${clock} UTC`,
  }
}

module.exports = {
  rebaseSidebar,
}
