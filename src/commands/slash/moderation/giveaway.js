const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  Channel,
  Webhook,
  ActionRowBuilder,
  ButtonBuilder,
  Client,
  ChannelSelectMenuBuilder,
  ButtonStyle,
} = require("discord.js");
const gaDb = require("../../../schemas/giveaway");
const gDb = require("../../../schemas/guild");
const { sendLogs } = require("../../../Functions/actionLogs");
const Duration = require("duration-js");
const moment = require("moment");

module.exports = {
  category: "giveaway",
  usage: "giveaway [create/check/delete/reroll]",
  structure: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Manage your giveaways!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((option) =>
      option
        .setName("create")
        .setDescription("Create a giveaway")
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription("The giveaway content (you can include the prize)")
            .setMaxLength(3000)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("time")
            .setDescription("The giveaway time (ex: 10m, 10h, 10d)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("prize")
            .setDescription("The giveaway prize")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("winners")
            .setDescription("How many winners? (default 1)")
            .setMaxValue(20)
            .setMinValue(1)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "The giveaway channel (leave empty to use the current channel)"
            )
        )
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role required to participate")
        )
        .addBooleanOption((option) =>
          option.setName("everyone-here").setDescription("Tag everyone?")
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("Provide an image URL for the embed")
        )
    )
    .addSubcommand((option) =>
      option
        .setName("check")
        .setDescription("List of active giveaways")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("Provide the message ID to check participants")
        )
    )
    .addSubcommand((option) =>
      option
        .setName("delete")
        .setDescription("Delete a giveaway")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("ID of the giveaway's message")
            .setRequired(true)
        )
    )
    .addSubcommand((option) =>
      option
        .setName("reroll")
        .setDescription("Reroll a giveaway")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("ID of the giveaway's message to reroll")
            .setRequired(true)
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: async (client, interaction) => {
    try {
      if (interaction.member.id !== "370995733509177355")
        return interaction.reply({
          content: "We are still working on this command. ETA: 24h",
          ephemeral: true,
        });

      const subCommand = interaction.options.getSubcommand();
      const { user, guild } = interaction;

      switch (subCommand) {
        case "create":
          {
            await interaction.reply({
              content: "Getting the giveaway settings...",
              ephemeral: true,
            });
            let gData = await gDb.findOne({
              guildId: interaction.guild.id,
            });
            if (!gData) {
              await gDb.create({
                guildId: interaction.guild.id,
              });
              gData = await gDb.findOne({
                guildId: interaction.guild.id,
              });
            }
            let giveaways = 0;
            await gaDb
              .find({
                guildId: interaction.guild.id,
              })
              .then((docs) => {
                giveaways = docs.filter((x) => {
                  !x.ended;
                }).length;
              });
            if (giveaways >= 2 && gData.premium.status == false) {
              return interaction.editReply({
                content: `Non premium servers can only have 3 giveaways at a time!`,
                ephemeral: true,
              });
            }
            const content = interaction.options
              .getString("content")
              .replace(/\\n/g, "\n");
            const time = interaction.options.getString("time");
            const everyone = interaction.options.getBoolean("everyone-here");
            const role = interaction.options.getRole("role");
            const winners = interaction.options.getInteger("winners") || 1;
            const prize = interaction.options.getString("prize");
            const channel =
              interaction.options.getChannel("channel") || interaction.channel;
            const duration = new Duration(time);
            if (duration.seconds() < 30 || duration.days() > 60)
              return interaction.editReply({
                content: `Minimum duration is 30 seconds and maximum is 60 days!`,
                ephemeral: true,
              });
            if (
              ![
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildVoice,
              ].includes(channel.type)
            )
              return interaction.editReply({
                content: `You can't create a giveaway in ${channel.type} channels`,
                ephemeral: true,
              });
            await interaction.editReply({
              content: "Creating the giveaway...",
              ephemeral: true,
            });
            const unixTime = moment().add(duration.seconds(), "s").unix();
            await channel
              .send({
                content: `Creating giveaway here...!`,
              })
              .then(async (msg) => {
                const embed = new EmbedBuilder()
                  .setTitle(`Giveaway for ${prize}`)
                  .setDescription(
                    `
				${content}

				> Ends: <t:${unixTime}:R>
				`
                  )
                  .setImage(interaction.options.getString("image"))
                  .setColor("DarkVividPink")
                  .setFooter({ text: `Winners: ${winners}` });
                const button = new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId(`joinga-${msg.id}`)
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Join Giveaway!")
                    .setEmoji("🎉"),
                  new ButtonBuilder()
                    .setCustomId(`parti-${msg.id}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Participants: 0")
                    .setEmoji("👥")
                    .setDisabled(true)
                );
                await msg.edit({
                  content: `${everyone ? "||@everyone @here||" : ""}`,
                  embeds: [embed],
                  components: [button],
                });
                await gaDb.create({
                  messageContent: content,
                  messageId: msg.id,
                  channelId: channel.id,
                  guildId: guild.id,
                  time: unixTime,
                  winners: winners,
                  role: role ? role.id : null,
                  startedBy: user.id,
                  prize: prize,
                });
                await sendLogs(guild, "Create Giveaway", {
                  description: `**Content**: ${content}\n**Time**: ${time}\n**Channel**: ${channel}\n**Winners**: ${winners}\n**Prize**: ${prize}\n**Everyone Here**: ${everyone}\n**Role**: ${
                    role ? role : "None"
                  }`,
                  color: "DarkVividPink",
                  avatarURL:
                    user.displayAvatarURL({ dynamic: true }) ||
                    user.defaultAvatarURL,
                  username: user.username,
                });
                await interaction.editReply({
                  content: `Giveaway created! Check ${channel}`,
                  ephemeral: true,
                });
              });
          }
          break;
        case "delete":
          {
            const messageId = interaction.options.getString("message-id");
            const giveaway = await gaDb.findOne({ messageId: messageId });
            if (!giveaway) {
              return interaction.reply({
                content: "No giveaway found with that ID!",
                ephemeral: true,
              });
            }
            if (giveaway.ended) {
              return interaction.reply({
                content: "This giveaway has already ended!",
                ephemeral: true,
              });
            }
            const channel = guild.channels.cache.get(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            await message.delete();
            await gaDb.deleteOne({ messageId: messageId });
            await interaction.reply({
              content: "Giveaway deleted!",
              ephemeral: true,
            });
            await sendLogs(guild, "Delete Giveaway", {
              description: `**Message ID**: ${messageId} for ${giveaway.prize} with ${giveaway.participants.length} participants`,
              color: "Red",
              avatarURL:
                user.displayAvatarURL({ dynamic: true }) ||
                user.defaultAvatarURL,
              username: user.username,
            });
          }
          break;
        case "check": {
          const messageId = interaction.options.getString("message-id");

          if (messageId) {
            const giveaway = await gaDb.findOne({ messageId: messageId });
            if (!giveaway) {
              return interaction.reply({
                content: "No giveaway found with that ID!",
                ephemeral: true,
              });
            }

            const participants = giveaway.participants || [];

            if (!participants.length) {
              return interaction.reply({
                content: "No participants found for this giveaway!",
                ephemeral: true,
              });
            }

            const taggedParticipants = participants
              .map((id) => `<@${id}>`)
              .join(", ");

            return interaction.reply({
              // content: `Participants for giveaway **${giveaway.prize}**:\n${taggedParticipants}`,
              // **Message ID**: ${x.messageId}\n- **Prize**: ${x.prize}\n- **Participants**: ${x.participants.length}\n- **Time**: <t:${x.time}:R>\n- **Started By**: <@${x.startedBy}>
              embeds: [
                new EmbedBuilder().setDescription(
                  `
                  Participants for giveaway **${giveaway.prize}**:\n${taggedParticipants}
                  `
                ).setColor("DarkVividPink"),
              ],
              ephemeral: true,
            });
          } else {
            const giveaways = [];
            await gaDb.find({ guildId: guild.id }).then((xs) => {
              xs.forEach((x) => {
                if (x.ended) return;
                giveaways.push(x);
              });
            });
            if (!giveaways.length || giveaways.length == 0) {
              return interaction.reply({
                content: "No giveaways found!",
                ephemeral: true,
              });
            }
            const embed = new EmbedBuilder()
              .setTitle("Active giveaways")
              .setDescription(
                `
              ${giveaways
                .map(
                  (x) =>
                    `> **Message ID**: ${x.messageId}\n- **Prize**: ${x.prize}\n- **Participants**: ${x.participants.length}\n- **Time**: <t:${x.time}:R>\n- **Started By**: <@${x.startedBy}>`
                )
                .join("\n")}
              `
              );
            await interaction.reply({ embeds: [embed] });
          }
          break;
        }
        case "reroll":
          {
            const messageId = interaction.options.getString("message-id");

            const giveaway = await gaDb.findOne({ messageId });
            if (!giveaway || giveaway.ended) {
              return interaction.reply({
                content: "No giveaway found or the giveaway has already ended!",
                ephemeral: true,
              });
            }
            if(!giveaway.ended) {
              return interaction.reply({
                content: "This giveaway has not ended yet!",
                ephemeral: true,
              });
            }
            if (!giveaway.participants || giveaway.participants.length < 1) {
              return interaction.reply({
                content: "Not enough participants to reroll!",
                ephemeral: true,
              });
            }

            const winners = [];
            for (let i = 0; i < giveaway.winners; i++) {
              const winnerIndex = Math.floor(
                Math.random() * giveaway.participants.length
              );
              winners.push(giveaway.participants[winnerIndex]);
              giveaway.participants.splice(winnerIndex, 1);
            }

            const taggedWinners = winners.map((id) => `<@${id}>`).join(", ");
            await interaction.reply({
              content: `New winner(s) for giveaway **${giveaway.prize}**: ${taggedWinners}`,
              ephemeral: true,
            });

            // Optionally, you can log the reroll action.
            await sendLogs(guild, "Reroll Giveaway", {
              description: `**Giveaway for**: ${giveaway.prize}\n**New Winners**: ${taggedWinners}`,
              color: "Yellow",
              avatarURL:
                user.displayAvatarURL({ dynamic: true }) ||
                user.defaultAvatarURL,
              username: user.username,
            });
          }
          break;
      }
    } catch (err) {
      interaction.followUp({
        content: `There was an error. Please check my permissions.`,
        ephemeral: true,
      });
      console.log(err);
    }
  },
};

// const {
//   ChatInputCommandInteraction,
//   SlashCommandBuilder,
//   EmbedBuilder,
//   PermissionFlagsBits,
//   ChannelType,
//   Channel,
//   Webhook,
//   ActionRowBuilder,
//   ButtonBuilder,
//   Client,
//   ChannelSelectMenuBuilder,
//   ButtonStyle,
// } = require("discord.js");
// const gaDb = require("../../../schemas/giveaway");
// const gDb = require("../../../schemas/guild");
// const { sendLogs } = require("../../../Functions/actionLogs");
// const Duration = require("duration-js");
// const moment = require("moment");
// module.exports = {
//   category: "giveaway",
//   usage: "giveaway [create/check/delete]",
//   structure: new SlashCommandBuilder()
//     .setName("giveaway")
//     .setDescription("Manage your giveaways!")
//     .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
//     .addSubcommand((option) =>
//       option
//         .setName("create")
//         .setDescription("Create a giveaway")
//         .addStringOption((option) =>
//           option
//             .setName("content")
//             .setDescription("The giveaway content (you can include the prize)")
//             .setMaxLength(3000)
//             .setRequired(true)
//         )
//         .addStringOption((option) =>
//           option
//             .setName("time")
//             .setDescription("The giveaway time (ex: 10m, 10h, 10d)")
//             .setRequired(true)
//         )
//         .addStringOption((option) =>
//           option
//             .setName("prize")
//             .setDescription("The giveaway prize")
//             .setRequired(true)
//         )
//         .addIntegerOption((option) =>
//           option
//             .setName("winners")
//             .setDescription("How many winners? (default 1)")
//             .setMaxValue(20)
//             .setMinValue(1)
//         )
//         .addChannelOption((option) =>
//           option
//             .setName("channel")
//             .setDescription(
//               "The giveaway channel (leave empty to use the current channel)"
//             )
//         )
//         .addRoleOption((option) =>
//           option.setName("role").setDescription("role required to participate")
//         )
//         .addBooleanOption((option) =>
//           option.setName("everyone-here").setDescription("tag everyone?")
//         )
//         .addStringOption((option) =>
//           option
//             .setName("image")
//             .setDescription("provide an image url for the embed")
//         )
//     )
//     .addSubcommand((option) =>
//       option.setName("check").setDescription("List of active giveaways")
//     )
//     .addSubcommand((option) =>
//       option
//         .setName("delete")
//         .setDescription("Delete a giveaway")
//         .addStringOption((option) =>
//           option
//             .setName("message-id")
//             .setDescription("Id of The giveaway's message")
//             .setRequired(true)
//         )
//     ),
//   /**
//    * @param {ChatInputCommandInteraction} interaction
//    * @param {Client} client
//    */
//   run: async (client, interaction) => {
//     try {
//       if (interaction.member.id !== "370995733509177355")
//         return interaction.reply({
//           content: "We are still working on this command. ETA: 24h",
//           ephemeral: true,
//         });
//       const subCommand = interaction.options.getSubcommand();
//       const { user, member, guild } = interaction;
//       switch (subCommand) {
//         case "create":
//           {
//             await interaction.reply({
//               content: "Getting the giveaway settings...",
//               ephemeral: true,
//             });
//             let gData = await gDb.findOne({
//               guildId: interaction.guild.id,
//             });
//             if (!gData) {
//               await gDb.create({
//                 guildId: interaction.guild.id,
//               });
//               gData = await gDb.findOne({
//                 guildId: interaction.guild.id,
//               });
//             }
//             let giveaways = 0;
//             await gaDb
//               .find({
//                 guildId: interaction.guild.id,
//               })
//               .then((docs) => {
//                 giveaways = docs.filter((x) => {
//                   !x.ended;
//                 }).length;
//               });
//             if (giveaways >= 2 && gData.premium.status == false) {
//               return interaction.editReply({
//                 content: `Non premium servers can only have 3 giveaways at a time!`,
//                 ephemeral: true,
//               });
//             }
//             const content = interaction.options.getString("content").replace(/\\n/g, '\n');
//             const time = interaction.options.getString("time");
//             const everyone = interaction.options.getBoolean("everyone-here");
//             const role = interaction.options.getRole("role");
//             const winners = interaction.options.getInteger("winners") || 1;
//             const prize = interaction.options.getString("prize");
//             const channel =
//               interaction.options.getChannel("channel") || interaction.channel;
//             const duration = new Duration(time);
//             if (duration.seconds() < 30 || duration.days() > 60)
//               return interaction.editReply({
//                 content: `Minimum duration is 30 seconds and maximum is 60 days!`,
//                 ephemeral: true,
//               });
//             if (
//               ![
//                 ChannelType.GuildText,
//                 ChannelType.GuildAnnouncement,
//                 ChannelType.GuildVoice,
//               ].includes(channel.type)
//             )
//               return interaction.editReply({
//                 content: `You can't create a giveaway in ${channel.type} channels`,
//                 ephemeral: true,
//               });
//             await interaction.editReply({
//               content: "Creating the giveaway...",
//               ephemeral: true,
//             });
//             const unixTime = moment().add(duration.seconds(), "s").unix();
//             await channel
//               .send({
//                 content: `Creating giveaway here...!`,
//               })
//               .then(async (msg) => {
//                 const embed = new EmbedBuilder()
//                   .setTitle(`Giveaway for ${prize}`)
//                   .setDescription(
//                     `
// 				${content}

// 				> Ends: <t:${unixTime}:R>
// 				`
//                   )
//                   .setImage(interaction.options.getString("image"))
//                   .setColor("DarkVividPink")
//                   .setFooter({ text: `Winners: ${winners}` });
//                 const button = new ActionRowBuilder().addComponents(
//                   new ButtonBuilder()
//                     .setCustomId(`joinga-${msg.id}`)
//                     .setStyle(ButtonStyle.Primary)
//                     .setLabel("Join Giveaway!")
//                     .setEmoji("🎉"),
//                   new ButtonBuilder()
//                     .setCustomId(`parti-${msg.id}`)
//                     .setStyle(ButtonStyle.Secondary)
//                     .setLabel("Participants: 0")
//                     .setEmoji("👥")
//                     .setDisabled(true)
//                 );
//                 await msg.edit({
//                   content: `${everyone ? "||@everyone @here||" : ""}`,
//                   embeds: [embed],
//                   components: [button],
//                 });
//                 await gaDb.create({
//                   messageContent: content,
//                   messageId: msg.id,
//                   channelId: channel.id,
//                   guildId: guild.id,
//                   time: unixTime,
//                   winners: winners,
//                   role: role ? role.id : null,
//                   startedBy: user.id,
//                   prize: prize,
//                 });
//                 await sendLogs(guild, "Create Giveaway", {
//                   description: `**Content**: ${content}\n**Time**: ${time}\n**Channel**: ${channel}\n**Winners**: ${winners}\n**Prize**: ${prize}\n**Everyone Here**: ${everyone}\n**Role**: ${
//                     role ? role : "None"
//                   }`,
//                   color: "DarkVividPink",
//                   avatarURL:
//                     user.displayAvatarURL({ dynamic: true }) ||
//                     user.defaultAvatarURL,
//                   username: user.username,
//                 });
//                 await interaction.editReply({
//                   content: `Giveaway created! Check ${channel}`,
//                   ephemeral: true,
//                 });
//               });
//           }
//           break;
//         case "delete":
//           {
//             const messageId = interaction.options.getString("message-id");
//             const giveaway = await gaDb.findOne({ messageId: messageId });
//             if (!giveaway) {
//               return interaction.reply({
//                 content: "No giveaway found with that ID!",
//                 ephemeral: true,
//               });
//             }
//             if (giveaway.ended) {
//               return interaction.reply({
//                 content: "This giveaway has already ended!",
//                 ephemeral: true,
//               });
//             }
//             const channel = guild.channels.cache.get(giveaway.channelId);
//             const message = await channel.messages.fetch(giveaway.messageId);
//             await message.delete();
//             await gaDb.deleteOne({ messageId: messageId });
//             await interaction.reply({
//               content: "Giveaway deleted!",
//               ephemeral: true,
//             });
//             await sendLogs(guild, "Delete Giveaway", {
//               description: `**Message ID**: ${messageId} for ${giveaway.prize} with ${giveaway.participants.length} participants`,
//               color: "Red",
//               avatarURL:
//                 user.displayAvatarURL({ dynamic: true }) ||
//                 user.defaultAvatarURL,
//               username: user.username,
//             });
//           }
//           break;
//         case "check":
//           {
//             const giveaways = [];
//             await gaDb.find({ guildId: guild.id }).then((xs) => {
//               xs.forEach((x) => {
//                 if (x.ended) return;
//                 giveaways.push(x);
//               });
//             });
//             if (!giveaways.length || giveaways.length == 0) {
//               return interaction.reply({
//                 content: "No giveaways found!",
//                 ephemeral: true,
//               });
//             }
//             const embed = new EmbedBuilder()
//               .setTitle("Active giveaways")
//               .setDescription(
//                 `
//               ${giveaways
//                 .map(
//                   (x) =>
//                     `> **Message ID**: ${x.messageId}\n- **Prize**: ${x.prize}\n- **Participants**: ${x.participants.length}\n- **Time**: <t:${x.time}:R>\n- **Started By**: <@${x.startedBy}>`
//                 )
//                 .join("\n")}
//               `
//               );
//             await interaction.reply({ embeds: [embed]});
//           }
//           break;
//       }
//     } catch (err) {
//       interaction.followUp({
//         content: `There was an error please check my permissions`,
//         ephemeral: true,
//       });
//       console.log(err);
//     }
//   },
// };
