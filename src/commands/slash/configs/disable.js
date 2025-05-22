const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Client,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const gDb = require("../../../schemas/guild");
const moment = require("moment");
module.exports = {
  category: "config",
  usage: "disable [command/channel/list]",
  structure: new SlashCommandBuilder()
    .setName("disable")
    .setDescription("Manage blacklisted channels and commands.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("command")
        .setDescription("Disable / Enable command")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("Command to manage")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("status")
            .setDescription("True = Enable | False = Disable")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Disable / Enable channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to manage")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("status")
            .setDescription("True = Enable | False = Disable")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List all blacklisted channels and commands.")
    ),
    options: {
        public: true
    },
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
    //   if (interaction.user.id !== "370995733509177355")
    //     return await interaction.reply({
    //       content: "This command is still under development!",
    //       ephemeral: true,
    //     });
      const sub = interaction.options.getSubcommand();
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
      switch (sub) {
        case "command":
          {
            const forcedCommands = ["help", "invite", "tempy", "setup", "disable"];
            const command = interaction.options.getString("command");
            const status = interaction.options.getBoolean("status");
            if (!status && gData.disabledCommands.includes(command))
              return await interaction.reply({
                content: `This command is already disabled!`,
                ephemeral: true,
              });
            if (status && !gData.disabledCommands.includes(command))
              return await interaction.reply({
                content: `This command is already enabled!`,
                ephemeral: true,
              });
            if (forcedCommands.includes(command))
              return await interaction.reply({
                content: `You can't disable \`${command}\` command!`,
                ephemeral: true,
              });
            if (!status) gData.disabledCommands.push(command);
            else
              gData.disabledCommands = gData.disabledCommands.filter(
                (c) => c !== command
              );
            await gData.save();
            await interaction.reply({
              content: `Command ${command} has been ${
                status ? "enabled" : "disabled"
              }!`,
              ephemeral: true,
            });
          }
          break;
        case "channel":
          {
            const channel = interaction.options.getChannel("channel");
            const status = interaction.options.getBoolean("status");
            if (!status && gData.disabledChannels.includes(channel.id))
              return await interaction.reply({
                content: `This channel is already disabled!`,
                ephemeral: true,
              });
            if (status && !gData.disabledChannels.includes(channel.id))
              return await interaction.reply({
                content: `This channel is already enabled!`,
                ephemeral: true,
              });
            if (
              !status &&
              !gData.premium.status &&
              gData.disabledChannels.length >= 25
            )
              return await interaction.reply({
                content: `Non premium guilds can't have more than 25 disabled channels!`,
                ephemeral: true,
              });
            if (!status) gData.disabledChannels.push(channel.id);
            else
              gData.disabledChannels = gData.disabledChannels.filter(
                (c) => c !== channel.id
              );
            await gData.save();
            await interaction.reply({
              content: `Channel ${channel} has been ${
                status ? "enabled" : "disabled"
              }!`,
              ephemeral: true,
            });
          }
          break;
        case "list": {
            const scrambledId = Math.floor(Math.random() * 10000);
          if (
            gData.disabledChannels.length == 0 &&
            gData.disabledCommands.length == 0
          )
            return await interaction.reply({
              content: "No channels or commands are disabled for this guild!",
              ephemeral: true,
            });
          await interaction
            .reply({
              content: "choose type",
              components: [
                new ActionRowBuilder().addComponents(
                  new StringSelectMenuBuilder()
                    .addOptions([
                      {
                        label: "blacklisted channels",
                        value: "channels",
                        emoji: "<:chimera_channel:1189615776953548931>",
                      },
                      {
                        label: "blacklisted commands",
                        value: "commands",
                        emoji: "<:chimera_slashcommand:1189612877875777546>",
                      },
                    ])
                    .setCustomId(`type-${scrambledId}`)
                    .setPlaceholder("select type")
                    .setMinValues(1)
                    .setMaxValues(1)
                ),
              ],
            })
            .then((msg) => {
              const filter = (i) => i.user.id === interaction.user.id;
              const collector = msg.createMessageComponentCollector({
                filter,
                time: 30 * 1000,
              });
              collector.on("collect", async (i) => {
                if (i.customId === `type-${scrambledId}`) {
                    i.deferUpdate();
                  let embed;
                  if (i.values[0] === "commands") {
                    const dCommands = gData.disabledCommands;
                    embed = new EmbedBuilder()
                      .setTitle("Disabled Commands")
                      .setDescription(
                        dCommands.length > 0
                          ? dCommands.map((c) => `> \`${c}\``).join("\n\n")
                          : "No commands are disabled!"
                      )
                      .setColor("DarkButNotBlack");
                  } else if (i.values[0] === "channels") {
                    const dChannels = gData.disabledChannels;
                    embed = new EmbedBuilder()
                      .setTitle("Disabled Channels")
                      .setDescription(
                        dChannels.length > 0
                          ? dChannels.map((c) => `> <#${c}>`).join("\n\n")
                          : "No channels are disabled!"
                      )
                      .setColor("DarkButNotBlack");
                  } else {
                    embed = new EmbedBuilder()
                      .setTitle("Unreachable turn")
                      .setDescription(`How tf did you get here? fucking hacker! contact the devs!`)
                      .setColor("DarkButNotBlack");
                  }
                  await msg.edit({
                    content: "",
                    embeds: [embed],
                  });
                }
              });
              collector.on("end", async () => {
                await msg.edit({
                  content: "Timed out!",
                  components: [],
                });
              })
            });
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
