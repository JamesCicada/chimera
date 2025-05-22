const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");
const { ActivityType } = require("discord.js");
const { checkPremiums } = require("../../otherEvents/premium/checker");
const { checkGiveaways } = require("../../otherEvents/giveaway/checkGiveaway");
const { checkTempRoles } = require("../../otherEvents/member/temprole");
const cronJob = require("cron").CronJob;
module.exports = {
  event: "ready",
  once: true,
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Client<true>} client
   * @returns
   */
  run: async (_, client) => {
    log("Logged in as: " + client.user.tag, "done");

    const guild = client.guilds.cache.get("1296466032201830522");
    const meBot = guild.members.cache.get(client.user.id);
    const mChannel = guild.channels.cache.get("1375102700261347358");
    const tChannel = guild.channels.cache.get("1296500978492768398");
    const mem = guild.members.cache.get("370995733509177355");
    const links = [
      "https://www.youtube.com/watch?v=n61ULEU7CO0",
    ];
    function startMusic() {
      const des = links[Math.floor(Math.random() * links.length)];
      client.distube.play(mChannel, des, {
        member: mem,
        textChannel: mChannel,
      });
    }
    // startMusic();
    // let i = 0;
    // setInterval(() => {
    //   if (!meBot.voice.channel) {
    //     startMusic();
    //     i++;
    //   } else {
    //     if (i <= 360) {
    //       i++;
    //     } else {
    //       i = 0;
    //       startMusic();
    //     }
    //   }
    // }, 1000 * 30);
    let activities = [
      {
        name: "/help",
        type: ActivityType.Listening,
      },
      {
        name: "Chimera",
        type: ActivityType.Watching,
      },
    ];
    setInterval(() => {
      activities.forEach((activity) => {
        client.user.setActivity(activity);
      });
    }, 1000 * 10);
    client.user.setStatus("idle");
	new cronJob("* * 0 * * *", async () => {
		await checkPremiums(client);
	}, null, true);
  new cronJob("*/15 * * * * *", async () => {
    await checkGiveaways(client);
    await checkTempRoles(client);
  }, null, true);
  },
};
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}