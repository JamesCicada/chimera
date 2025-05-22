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
    
    // const mainG = '1189604617869328444';
    // const guilds = client.guilds.cache;
    // let ii = 1;
    // guilds.each(async (guild) => {
    //   let chance = 1// Math.floor(Math.random() * 100)
    //   let mems = guild.memberCount;
    //   if(guild.id !== mainG && mems < 4 && chance < 65) {
    //     await guild.leave();
    //     console.log(`${ii++} Left ${guild.name} (${mems})`)
    //     await sleep(1500)
    //   };
    // })

    // const user = client.users.cache.get("370995733509177355");
    // await user.createDM();
    // const dms = await user.dmChannel.messages.fetch({ limit: 100 }).then((m) => {
    // 	m.forEach((msg) => {
    // 		if(msg.author.id !== client.user.id) return;
    // 		msg.delete();
    // 	})
    // });
    const guild = client.guilds.cache.get("1166209058630533131");
    const meBot = guild.members.cache.get(client.user.id);
    const mChannel = guild.channels.cache.get("1190445340655095928");
    const tChannel = guild.channels.cache.get("1190637725200687195");
    const mem = guild.members.cache.get("370995733509177355");
    const links = [
      "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      "https://www.youtube.com/watch?v=4xDzrJKXOOY",
      "https://www.youtube.com/watch?v=rUxyKA_-grg",
    ];
    function startMusic() {
      const des = links[Math.floor(Math.random() * links.length)];
      console.log(des);
      client.distube.play(mChannel, des, {
        member: mem,
        textChannel: mChannel,
      });
    }
    // startMusic();
    let i = 0;
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
    // }, 1000 * 10);
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