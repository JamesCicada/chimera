const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const stDb = require("../../../schemas/stream");
const {sendLogs} = require('../../../Functions/actionLogs')
module.exports = {
  category: 'moderation',
  usage: "stream [add/remove]",
  structure: new SlashCommandBuilder()
    .setName("stream")
    .setDescription("Manage stream alerts!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("add stream alert!")
        .addStringOption((option) =>
          option
            .setName("username")
            .setDescription("username of the streamer")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option.setName("channel").setDescription("channel to send the embed")
        )
        .addStringOption((option) =>
          option.setName("role").setDescription("roleId, (Guild ID = everyone)")
        )
        .addBooleanOption((option) =>
          option
            .setName("edit-when-end")
            .setDescription("edit the message when the stream ends")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("remove stream alert!")
        .addStringOption((option) =>
          option
            .setName("username")
            .setDescription("username of the streamer")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  options: {
    cooldown: 15000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      if (interaction.user.id !== "370995733509177355")
        return interaction.reply({
          content: "This command is only for the developer!",
          ephemeral: true,
        });
      const subcommand = interaction.options.getSubcommand();
      switch (subcommand) {
        case "add":
          {
            const username = interaction.options.getString("username");
            if (username.split(" ").length > 1)
              return interaction.reply({
                content: "Please don't use spaces in the username!",
                ephemeral: true,
              });
            const channel = interaction.options.getChannel("channel");
            const role = interaction.options.getString("role");
            const editWhenEnd = interaction.options.getBoolean("edit-when-end");
            let stData = await stDb.findOne({
              username: username,
            });
            if (!stData) {
              stData = await stDb.create({
                username: username,
              });
              stData = await stDb.findOne({
                username: username,
              });
            }
            if(stData.subscribedGuilds.some(x => x.guildId == interaction.guild.id)) {
              return interaction.reply({
                content: "Already added to stream alerts!",
                ephemeral: true
              })
            }
            await channel
              .createWebhook({
                name: "Chimera Stream Alerts",
                avatar: client.user.displayAvatarURL(),
                reason: "Chimera Stream Alerts",
              })
              .then(async (whook) => {
                if (!whook.url)
                  return interaction.reply({
                    content: "Failed to create webhook",
                    ephemeral: true,
                  });
                let gData = {
                  guildId: interaction.guild.id,
                  channelId: whook.url,
                  tagRole: role,
                  editWhenEnd: editWhenEnd,
                };
                await stData.updateOne({ $addToSet: { subscribedGuilds: gData } });
              });

            interaction.reply({
              content: `Added ${username} to stream alerts in channel ${channel}!`,
              ephemeral: true,
            });
            await sendLogs(interaction.guild, `Cretaed stream alert`, {
              username: client.user.username,
              avatarURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }),
              color: 'Green',
              description: `Added ${username} to stream alerts in channel ${channel}!`
            })
          }
          break;
          case "remove": {
            const username = interaction.options.getString("username");
            let stData = await stDb.findOne({
              username: username,
            });
            if (!stData) {
              return interaction.reply({
                content: "User not found in stream alerts!",
                ephemeral: true,
              });
            }
            if(!stData.subscribedGuilds.some(x => x.guildId == interaction.guild.id)) {
              return interaction.reply({
                content: "User not found in stream alerts!",
                ephemeral: true
              })
            }
            await interaction.guild.fetchWebhooks().then(async (whooks) => {
              whooks
                .filter((x) => x.url == stData.subscribedGuilds.find((y) => y.guildId == interaction.guild.id).channelId)
                .forEach((x) => {
                  x.delete('Removed from stream alerts');
                });
            })
            await stData.updateOne({ $pull: { subscribedGuilds: { guildId: interaction.guild.id } } });
            interaction.reply({
              content: `Removed ${username} from stream alerts!`,
              ephemeral: true,
            });
            await sendLogs(interaction.guild, `Deleted stream alert`, {
              username: client.user.username,
              avatarURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }),
              color: 'Red',
              description: `Remove ${username} from stream alerts!`
            })
          }
          break;
      }
    } catch (err) {
      interaction.reply({
        content: `There was an error please check my permissions`,
        ephemeral: true,
      });
      console.log(err);
    }
  },
};
