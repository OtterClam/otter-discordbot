require("dotenv").config();
const {
  DISCORD_BOND_MAI_CLAM_BOT_TOKEN,
  DISCORD_BOND_MAI_BOT_TOKEN,
  UPDATE_INTERVAL,
} = process.env;
const { getRawMarketPrice, getRawBondPrice } = require("./price");

const { Client } = require("discord.js");

const bot = new Client();
let pastPriceBuf;

const getPriceData = async () => {
  const rawMarketPrice = await getRawMarketPrice();
  const rawBondPrice = await getRawBondPrice(process.argv[2]);
  const bondDiscount =
    (rawMarketPrice.toNumber() * Math.pow(10, 9) - rawBondPrice) / rawBondPrice;

  return {
    price: Number(rawBondPrice / Math.pow(10, 18)).toFixed(2),
    roi: Number(bondDiscount * 100).toFixed(2),
  };
};

function updateBondStatus() {
  const updatePriceAsync = async () => {
    const { roi, price } = await getPriceData();
    const pastPrice = pastPriceBuf || 0;
    pastPriceBuf = price;

    console.log(`${pastPrice} ${price}, ROI ${roi}`);

    const bondName = process.argv[2] == "MAI" ? "Bond MAI" : "Bond CLAM/MAI";
    await bot.user.setActivity({
      name: `$${price} ROI: ${roi}%`,
      type: "WATCHING",
    });
    await Promise.all(
      bot.guilds.cache.map(async (guild) => {
        await guild.me.setNickname(`${bondName}`);
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
  updateBondStatus();
  setInterval(updateBondStatus, UPDATE_INTERVAL);
});

if (process.argv[2] === "MAI") {
  bot.login(DISCORD_BOND_MAI_BOT_TOKEN);
} else if (process.argv[2] === "MAI_CLAM") {
  bot.login(DISCORD_BOND_MAI_CLAM_BOT_TOKEN);
} else {
  throw new Error("should input MAI or MAI_CLAM");
}
