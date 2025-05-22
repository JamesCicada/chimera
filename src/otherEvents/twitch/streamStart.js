const {
  WebhookClient,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const moment = require("moment");
const axios = require("axios");
const CronJob = require("cron").CronJob;
const stDb = require("../../schemas/stream");
const ttv = {
  id: process.env.TTVID,
  secret: process.env.TTVTOKEN,
};
const delayCheck = [];
async function run(client) {
  try {
    token = await getToken();
    new CronJob("*/30 * * * * *", async function () {
      await stDb.find({}).then(async (docs) => {
        docs.forEach(async (doc) => {
          await ttvCheck(doc.username).then(async (data) => {
            if (data && data.data[0]) {
              const stream = data.data[0];
              // console.log(stream);
              const subs = doc.subscribedGuilds.map((x) => x);
              for (const sub of subs) {
                const guild = client.guilds.cache.get(sub.guildId);
                if (doc.notifiedGuilds.includes(guild.id)) return;
                await doc.updateOne({
                  $addToSet: {
                    notifiedGuilds: guild.id,
                  },
                });
                const whook = new WebhookClient({
                  url: sub.channelId,
                });
                const embed = new EmbedBuilder()
                  .setTitle(
                    `${stream.user_name} is now Streaming ${
                      stream.game_name || "Just Chatting"
                    }!`
                  )
                  .setURL(`https://twitch.tv/${stream.user_login}`)
                  .setDescription(
                    `
                  > Title: ${stream.title}

                  > Game: ${stream.game_name}
                  `
                  )
                  .setColor("DarkPurple")
                  .setImage(
                    stream.thumbnail_url
                      .replace("{width}", "1920")
                      .replace("{height}", "1080")
                  )
                  .setFooter({
                    text: `Viewer Count: ${stream.viewer_count}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                  });
                whook
                  .send({
                    content: `${sub.tagRole ? `<@&${sub.tagRole}>` : ""}`,
                    username: "Chimera Stream Alerts",
                    avatarURL: client.user.displayAvatarURL({ dynamic: true }),
                    embeds: [embed],
                    components: [
                      new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setLabel("Watch on Twitch")
                          .setStyle("Link")
                          .setURL(`https://twitch.tv/${stream.user_login}`)
                      ),
                    ],
                  })
                  .then(async (msg) => {
                    // now we update the subscribed guild with the message id
                    doc = await stDb.findOne({ username: doc.username });
                    doc.subscribedGuilds.map((x) => {
                      if (x.guildId == guild.id) {
                        x.messageId = msg.id;
                      }
                    })
                    await doc.save();
                  });
              }
            } else {
              // console.log("Here");
              for (const sub of doc.subscribedGuilds) {
                if (sub.editWhenEnd) {
                  const guild = client.guilds.cache.get(sub.guildId);
                  if (!doc.notifiedGuilds.includes(guild.id)) return;
                  await doc.updateOne({
                    $pull: {
                      notifiedGuilds: guild.id,
                    },
                  });
                  const whook = new WebhookClient({
                    url: sub.channelId,
                  });
                  let mes = await whook.fetchMessage(sub.messageId);
                  await whook.editMessage(sub.messageId, {
                    content: "",
                    embeds: [
                      new EmbedBuilder()
                        .setDescription(
                          `${doc.username} has ended their stream!
                          
                          > Lasted for ${moment(mes.timestamp).fromNow(true)}
                          `
                        )
                        .setColor("DarkPurple"),
                    ],
                    components: [],
                  });
                }
              }
            }
          });
        });
      });
    }, null, true);
    new CronJob(
      "* * 0 * * *",
      async function () {
        token = await getToken();
      },
      null,
      true
    );
  } catch (err) {
    // console.log(err);
  }
}
async function ttvCheck(channel) {
  try {
    const { data } = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${channel}`,
      {
        headers: {
          "Client-ID": ttv.id,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if(data.data.length == 0) {
      delayCheck.push(channel);
    }
    return data;
  } catch (err) {
    // console.log(err);
  }
}

async function getToken() {
  const { data } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${ttv.id}&client_secret=${ttv.secret}&grant_type=client_credentials`
  );
  return data.access_token;
}
module.exports = { run };
