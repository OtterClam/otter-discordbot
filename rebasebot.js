require("dotenv").config();
const { DISCORD_REBASE_BOT_TOKEN, UPDATE_INTERVAL } = process.env;
const { getEpoch } = require("./price");
const { prettifySeconds } = require("./utils");

const { Client } = require("discord.js");

const bot = new Client();

function updatePriceStatus() {
  const updatePriceAsync = async () => {
    const { epoch, currentBlockTime, currentEndTime } = await getEpoch();

    const nextRebaseIn = prettifySeconds(currentEndTime - currentBlockTime);
    const t = new Date(currentBlockTime * 1000);
    const clock = t.getUTCHours() + ":" + t.getUTCMinutes();
    console.log(`${epoch} ${nextRebaseIn} @ ${clock} UTC`);

    await bot.user.setActivity(`Epoch: ${epoch} @ ${clock} UTC`);
    await Promise.all(
      bot.guilds.cache.map(async (guild) => {
        await guild.me.setNickname(`Rebase In: ${nextRebaseIn}`);
      })
    );
  };
  updatePriceAsync().catch(console.error);
}

// New server join event that causes the guild cache to refresh
bot.on("guildCreate", (guild) => {
  console.log(`New server has added the bot! Name: ${guild.name}`);
});

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  updatePriceStatus();
  setInterval(updatePriceStatus, UPDATE_INTERVAL);
});

bot.login(DISCORD_REBASE_BOT_TOKEN);
