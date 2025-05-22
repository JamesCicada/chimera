const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Client,
} = require("discord.js");
const gaDb = require("../../schemas/giveaway");
const moment = require("moment");
const { sendLogs } = require("../../Functions/actionLogs");
/**
 * @param {Client} client
 */
async function checkGiveaways(client) {
  const giveaways = (await gaDb.find({})).filter((x) => {
    return !x.ended;
  });
  for (const giveaway of giveaways) {
    const server = client.guilds.cache.get(giveaway.guildId);
    const channel = server.channels.cache.get(giveaway.channelId);
    const time = giveaway.time;
    const now = moment().unix();
    // console.log(now,'\n',time);
    if (now >= time) {
      giveaway.ended = true;
      giveaway.save();
      let message = await channel.messages
        .fetch(giveaway.messageId)
        .catch(() => {});
      if (!message) continue;
      const winners = pickWinner(giveaway.participants, giveaway.winners);
      let initDesc = message.embeds[0];
      const embed = new EmbedBuilder()
        .setDescription(initDesc.description)
        .setTitle(initDesc.title)
        .setFooter(initDesc.footer)
        .setFields(
          { name: "Winners", value: winners.length.toString(), inline: false },
          ...winners.map((u, i) => {
            return { name: `**${i + 1}.**`, value: `<@${u}>`, inline: true };
          })
        )
        .setColor("Green");
      if (initDesc.image) {
        embed.setImage(initDesc.image.url);
      } //
      message.edit({
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`${giveaway.messageId}-end`)
              .setStyle(ButtonStyle.Danger)
              .setLabel("Giveaway Ended")
              .setEmoji("⏱")
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId(`${giveaway.messageId}-reroll`)
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Reroll")
              .setEmoji("🔀")
          ),
        ],
      });
      message.channel.send({
        content: `🎉 Congratulations ${winners.map(
          (u) => `<@${u}>`
        )}! You won the giveaway for **${giveaway.prize}**!\nContact <@${
          giveaway.startedBy
        }> to claim your prize!`,
      });
      if (!winners || winners.length === 0)
        return await channel.send({
          content: `No one participated. is this server dead? 💀`,
        });
      // await channel.send({
      //   content: `🎉 Congratulations ${winners.map(
      //     (u) => `<@${u}>`
      //   )}! You won the giveaway for **${giveaway.prize}**!\nContact <@${
      //     giveaway.startedBy
      //   }> to claim your prize!`,
      // });
      await sendLogs(server, "Giveaway Ended", {
        description: `**Ended Giveaway**\n\n**Prize:** ${
          giveaway.prize
        }\n**Winners:** ${winners
          .map((u) => `<@${u}>`)
          .join(", ")}\n**Ended By:** <@${giveaway.startedBy}>`,
        avatarURL: client.user.displayAvatarURL(),
        username: "Giveaway Ended",
      });
    }
  }
}
module.exports = { checkGiveaways };
// cronJob("* * 0 * * *", checkPremiums(), null, true)

function pickWinner(participants, winners) {
  const winnersArray = [];
  const parts = [...participants];
  for (let i = 0; i < winners; i++) {
    const random = Math.floor(Math.random() * parts.length);
    winnersArray.push(parts[random]);
    if (parts.length == 0) break;
    parts.splice(random, 1);
  }
  return winnersArray.filter((x) => x);
}
