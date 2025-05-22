const moment = require("moment");
const {
  Interaction,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const gaDb = require("../../schemas/giveaway");
const { sendLogs } = require("../../Functions/actionLogs");
/**
 * @param {Interaction} interaction
 * @param {Client} client
 */
module.exports = {
  event: "interactionCreate",
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    try {
      const { customId, values, member, user, guild } = interaction;
      if (!interaction.isButton()) return;
      if (interaction.customId.startsWith(`joinga-${interaction.message.id}`)) {
        let giveaway = await gaDb.findOne({
          messageId: interaction.message.id,
        });

        if (!giveaway)
          return interaction.reply({
            content: "Something went wrong!",
            ephemeral: true,
          });
        if (giveaway.role) {
          const role = giveaway.role
            ? guild.roles.cache.get(giveaway.role)
            : null;
          if (!role)
            return interaction.reply({
              content: "Something went wrong!",
              ephemeral: true,
            });
          if (!member.roles.cache.has(role.id))
            return interaction.reply({
              content: `You need to have the role <@&${giveaway.role}> to join!`,
              ephemeral: true,
            });
        }

        let isParticipant = giveaway.participants.includes(member.id);
        if (!isParticipant) {
          giveaway = await gaDb.findOneAndUpdate(
            { messageId: interaction.message.id },
            { $addToSet: { participants: member.id } }
          );
          giveaway = await gaDb.findOne({ messageId: interaction.message.id });
          const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`joinga-${interaction.message.id}`)
              .setStyle(ButtonStyle.Primary)
              .setLabel("Join Giveaway!")
              .setEmoji("🎉"),
            new ButtonBuilder()
              .setCustomId(`parti-${interaction.message.id}`)
              .setStyle(ButtonStyle.Secondary)
              .setLabel(`Participants: ${giveaway.participants.length}`)
              .setEmoji("👥")
              .setDisabled(true)
          );
          await interaction.message.edit({ components: [button] });
          sendLogs(guild, "Join Giveaway", {
            description: `User ${member.user.tag} joined the giveaway ${interaction.message.url}!`,
            color: "Green",
            avatarURL: member.user.displayAvatarURL({ dynamic: true }),
            username: member.user.username,
          });
          return interaction.reply({
            content: "You have joined the giveaway! Good luck!",
            ephemeral: true,
          });
        } else {
          const embed = new EmbedBuilder()
            .setDescription(
              `You already joined the giveaway. Do you want to leave?`
            )
            .setColor("DarkRed");
          const leaveButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`leavega-${interaction.message.id}`)
              .setStyle(ButtonStyle.Danger)
              .setLabel("Leave Giveaway?")
              .setEmoji("✖")
          );
          await interaction.reply({
            embeds: [embed],
            components: [leaveButton],
            ephemeral: true,
          });
          const filter = (i) => i.user.id === member.id;
          const collector = interaction.channel.createMessageComponentCollector(
            { filter, time: 15000 }
          );
          collector.on("collect", async (i) => {
            if (i.customId === `leavega-${interaction.message.id}`) {
              giveaway.participants = giveaway.participants.filter(
                (id) => id !== member.id
              );
              await giveaway.save();
              giveaway = await gaDb.findOne({
                messageId: interaction.message.id,
              });
              const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`joinga-${interaction.message.id}`)
                  .setStyle(ButtonStyle.Primary)
                  .setLabel("Join Giveaway!")
                  .setEmoji("🎉"),
                new ButtonBuilder()
                  .setCustomId(`parti-${interaction.message.id}`)
                  .setStyle(ButtonStyle.Secondary)
                  .setLabel(`Participants: ${giveaway.participants.length}`)
                  .setEmoji("👥")
                  .setDisabled(true)
              );
              await interaction.message.edit({ components: [button] });
              await sendLogs(guild, "Left Giveaway", {
                description: `User ${member.user.tag} Left the giveaway ${interaction.message.url}!`,
                color: "Red",
                avatarURL: member.user.displayAvatarURL({ dynamic: true }),
                username: member.user.username,
              });
              return interaction.editReply({
                content: "You have left the giveaway!",
                ephemeral: true,
              });
            }
          });
          collector.on("end", async (i) => {
            if (i.size == 0) {
              await interaction.editReply({
                content: "You took too long to respond. Action cancelled.",
                ephemeral: true,
              });
            }
          });
        }
      } else if (interaction.customId === `${interaction.message.id}-reroll`) {
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          )
        ) {
          return interaction.reply({
            content: "Only admins can reroll giveaways!",
            ephemeral: true,
          });
        }
        let giveaway = await gaDb.findOne({
          messageId: interaction.message.id,
        });
        if (!giveaway)
          return interaction.reply({
            content: "Something went wrong!",
            ephemeral: true,
          });
        if (giveaway.participants.length === 0)
          return interaction.reply({
            content: "No one participated. is this server dead? 💀",
            ephemeral: true,
          });
        const winners = pickWinner(giveaway.participants, giveaway.winners);
        let initDesc = interaction.message.embeds[0];
        console.log([
          { name: "Winners", value: winners.length, inline: false },
          ...winners.map((u, i) => {
            return { name: `**${i + 1}.**`, value: `<@${u}>`, inline: true };
          }),
        ]);
        const embed = new EmbedBuilder()
          .setDescription(initDesc.description)
          .setTitle(initDesc.title)
          .setFooter(initDesc.footer)
          .setFields([
            {
              name: "Winners",
              value: winners.length.toString(),
              inline: false,
            },
            ...winners.map((u, i) => {
              return { name: `**${i + 1}.**`, value: `<@${u}>`, inline: true };
            }),
          ])
          .setColor("Green");
        if (initDesc.image) {
          embed.setImage(initDesc.image.url);
        }
        interaction.message
          .edit({
            embeds: [embed],
          })
          .catch((err) => {
            console.log(err);
          });
        interaction.channel.send({
          content: `Rerolled the giveaway!\nCongratulations to ${winners
            .map((u) => `<@${u}>`)
            .join(", ")}!`,
        });
        interaction.reply({
          content: `Rerolled the giveaway!`,
          ephemeral: true,
        });
        await sendLogs(guild, "Giveaway Reroll", {
          description: `**Rerolled Giveaway**\n\n**Prize:** ${
            giveaway.prize
          }\n**Winners:** ${winners
            .map((u) => `<@${u}>`)
            .join(", ")}\n**Rerrolled By:** <@${giveaway.startedBy}>`,
          avatarURL: interaction.user.displayAvatarURL({ dynamic: true }),
          username: interaction.user.username,
          color: "Green",
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
};
function pickWinner(participants, winners) {
  const winnersArray = [];
  for (let i = 0; i < winners; i++) {
    const random = Math.floor(Math.random() * participants.length);
    winnersArray.push(participants[random]);
    if (participants.length == 0) break;
    participants.splice(random, 1);
  }
  return winnersArray.filter((x) => x);
}
