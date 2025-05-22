const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const srDb = require("../../../schemas/selfrole");
const GuildSchema = require("../../../schemas/guild");
const { sendLogs } = require("../../../Functions/actionLogs");

module.exports = {
  category: "moderation",
  usage: "selfrole [create/delete/edit]",
  structure: new SlashCommandBuilder()
    .setName("selfrole")
    .setDescription("Setup a new self role panel")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a self role panel")
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("The title of the embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("roles")
            .setDescription(
              "provide a list of roles separated by commas (,) Max 25 roles"
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "the channel to send the panel (Default: current channel)"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("emojis")
            .setDescription(
              "provide a list of emojis separated by commas (,) (role1:emoji1,role2:emoji2...)"
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("labels")
            .setDescription(
              "provide a list of labels separated by commas (,) (role1:label1,role2:label2...) (Default: role name)"
            )
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("multiple")
            .setDescription("Allow multiple roles?")
            .setRequired(false)
        )
        .addNumberOption((option) =>
          option
            .setName("limit")
            .setDescription("set a custom limit (1 ~ 25)")
            .setMinValue(1)
            .setMaxValue(25)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("type of self role panel, (Default: Select Menu)")
            .addChoices(
              { name: "Select Menu", value: "select" },
              { name: "Buttons", value: "buttons" }
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("provide an image url for the embed")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("counter")
            .setDescription("enable counter")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit a self role panel")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Id of The panel message")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("The title of the embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("roles")
            .setDescription(
              "provide a list of roles separated by commas (,) Max 25 roles"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("emojis")
            .setDescription(
              "provide a list of emojis separated by commas (,) (role1:emoji1,role2:emoji2...)"
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("labels")
            .setDescription(
              "provide a list of labels separated by commas (,) (role1:label1,role2:label2...) (Default: role name)"
            )
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("provide an image url for the embed")
            .setRequired(false)
        )
        .addNumberOption((option) =>
          option
            .setName("limit")
            .setDescription("set a custom limit (1 ~ 25)")
            .setMinValue(1)
            .setMaxValue(25)
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("multiple")
            .setDescription("Allow multiple roles?")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a self role panel")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Id of The panel message")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List all self role panels in this server")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("help")
        .setDescription("List of self role panel commands")
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
    const { options, guild, member } = interaction;
    const subcommand = options.getSubcommand();
    switch (subcommand) {
      case "create":
        {
          const allowedChannels = [
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.GuildAnnouncement,
          ];
          const title = options.getString("title");
          // we sanitize the roles and emojis and labels by removing whitespaces
          const roles = options
            .getString("roles")
            .split(",")
            .map((r) => r.trim());
          const emojis =
            options.getString("emojis") &&
            options
              .getString("emojis")
              .split(",")
              .map((e) => e.trim());
          const labels =
            options.getString("labels") &&
            options
              .getString("labels")
              .split(",")
              .map((l) => l.trim());
          const channel = options.getChannel("channel") || interaction.channel;
		  const counter = options.getBoolean("counter");
          if (!allowedChannels.includes(channel.type)) {
            return interaction.reply({
              content: `You can't send panel in ${channel.type} channel!`,
              ephemeral: true,
            });
          }
          const limit = options.getNumber("limit");
          const multiple = options.getBoolean("multiple");
          const type = options.getString("type");
          await interaction.reply({
            content:
              "<a:chimera_loading:1189609175840460961> Creating self role panel...",
          });
          const { dangerRoles, unmanagedRoles } = await checkRoles(roles);
          if (dangerRoles.length > 0) {
            return interaction.editReply({
              content: `Following roles have dangerous permissions and cannot be used in the self role panel: ${dangerRoles
                .map((r) => `<@&${r}>`)
                .join(", ")}`,
            });
          }
          if (unmanagedRoles.length > 0) {
            return interaction.editReply({
              content: `Following roles are not managed by the bot and cannot be used in the self role panel: ${unmanagedRoles
                .map((r) => `<@&${r}>`)
                .join(", ")}`,
            });
          }
          const components = [];
          if (type === "select") {
            components.push(
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`selfrole-${Date.now().valueOf()}`)
                  .setPlaceholder("Select a role")
                  .setMinValues(1)
                  .setMaxValues(limit || roles.length)
                  .addOptions(
                    roles.map((role, index) => {
                      return {
                        label:
                          (labels && labels[index]) ||
                          guild.roles.cache.get(role)?.name ||
                          " ",
                        value: role,
                        emoji: (emojis && emojis[index]) || "▫️",
                      };
                    })
                  )
              )
            );
          } else if (type === "buttons") {
            if (roles.length <= 5) {
              components.push(
                new ActionRowBuilder().addComponents(
                  roles.map((role, index) => {
                    return new ButtonBuilder()
                      .setCustomId(`selfrole-${role}`)
                      .setLabel(
                        (labels && labels[index]) ||
                          guild.roles.cache.get(role)?.name ||
                          " "
                      )
                      .setEmoji((emojis && emojis[index]) || "▫️")
                      .setStyle(ButtonStyle.Primary);
                  })
                )
              );
            } else {
              for (let i = 0; i < roles.length; i += 5) {
                components.push(
                  new ActionRowBuilder().addComponents(
                    roles.slice(i, i + 5).map((role, index) => {
                      return new ButtonBuilder()
                        .setCustomId(`selfrole-${role}`)
                        .setLabel(
                          labels[index] ||
                            guild.roles.cache.get(role)?.name ||
                            " "
                        )
                        .setEmoji(emojis[index] || null)
                        .setStyle(ButtonStyle.Primary);
                    })
                  )
                );
              }
            }
          }
          const roleSchema = [
            ...roles.map((role) => {
              return {
                roleIndex: roles.indexOf(role),
                roleId: role,
                roleLabel: (labels && labels[roles.indexOf(role)]) || null,
                roleEmoji: (emojis && emojis[roles.indexOf(role)]) || null,
              };
            }),
          ];

          channel
            .send({
              embeds: [
                new EmbedBuilder().setTitle(title).setDescription(
                  `
                            ${roles
                              .map(
                                (role, index) =>
                                  `> ${
                                    (emojis && emojis[index]) || ""
                                  } - <@&${role}> - ${
                                    (labels && labels[index]) || " "
                                  }`
                              )
                              .join("\n\n")}
                            `
                ),
              ],
              components: components,
            })
            .then(async (msg) => {
              await srDb.create({
                guildId: guild.id,
                roles: roleSchema,
                method: type,
                allowMultiple: multiple,
                limit: limit || roles.length,
                channelId: channel.id,
                messageId: msg.id,
				counter: counter || false,
              });

              interaction.editReply({
                content: `Self role panel created in ${channel}!\n Panel link: ${msg.url}`,
              });
              await sendLogs(interaction.guild, "selfrole-setup", {
                description: `${interaction.user} created self role panel in ${channel} \n Panel link: ${msg.url}\n type: ${type}`,
                color: "Aqua",
                avatarURL: interaction.user.displayAvatarURL(),
                username: interaction.user.username,
              });
            });
        }
        break;
      case "edit":
        {
          const messageId = options.getString("id").trim();
          const title = options.getString("title").trim();
          const roles = options
            .getString("roles")
            .split(",")
            .map((r) => r.trim());
          const emojis =
            options.getString("emojis") &&
            options
              .getString("emojis")
              .split(",")
              .map((e) => e.trim());
          const labels =
            options.getString("labels") &&
            options
              .getString("labels")
              .split(",")
              .map((l) => l.trim());
          const limit = options.getNumber("limit");
          const multiple = options.getBoolean("multiple");
          const srData = await srDb.findOne({
            guildId: guild.id,
            messageId,
          });
          if (!srData) {
            return interaction.editReply({
              content: "Self role panel not found",
            });
          }
          const type = srData.method;
          const components = [];
          if (type === "select") {
            components.push(
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`selfrole-${Date.now().valueOf()}`)
                  .setPlaceholder("Select a role")
                  .setMinValues(1)
                  .setMaxValues(limit || roles.length)
                  .addOptions(
                    roles.map((role, index) => {
                      return {
                        label:
                          labels[index] ||
                          guild.roles.cache.get(role)?.name ||
                          " ",
                        value: role,
                        emoji: emojis[index] || null,
                      };
                    })
                  )
              )
            );
          } else if (type === "buttons") {
            if (roles.length <= 5) {
              components.push(
                new ActionRowBuilder().addComponents(
                  roles.map((role, index) => {
                    return new ButtonBuilder()
                      .setCustomId(`selfrole-${role}`)
                      .setLabel(
                        (labels && labels[index]) ||
                          guild.roles.cache.get(role)?.name ||
                          " "
                      )
                      .setEmoji((emojis && emojis[index]) || "▫️")
                      .setStyle(ButtonStyle.Primary);
                  })
                )
              );
            } else {
              for (let i = 0; i < roles.length; i += 5) {
                components.push(
                  new ActionRowBuilder().addComponents(
                    roles.slice(i, i + 5).map((role, index) => {
                      return new ButtonBuilder()
                        .setCustomId(`selfrole-${role}`)
                        .setLabel(
                          (labels && labels[index]) ||
                            guild.roles.cache.get(role)?.name ||
                            " "
                        )
                        .setEmoji((emojis && emojis[index]) || null)
                        .setStyle(ButtonStyle.Primary);
                    })
                  )
                );
              }
            }
          }

          const roleSchema = roles.map((role) => {
            return {
              roleIndex: roles.indexOf(role),
              roleId: role,
              roleLabel: labels && labels[roles.indexOf(role)],
              roleEmoji: emojis && emojis[roles.indexOf(role)],
            };
          });
          await srData.updateOne({
            roles: roleSchema,
            limit: limit || roles.length,
            allowMultiple: multiple,
            title: title,
          });
          const channel = guild.channels.cache.get(srData.channelId);
          if (!channel) {
            return interaction.editReply({
              content: "Self role panel not found",
            });
          }
          await channel.messages.fetch(messageId).then(async (msg) => {
            msg.edit({
              embeds: [
                new EmbedBuilder().setTitle(title).setDescription(
                  `
								${roles
                  .map(
                    (role, index) =>
                      `> ${(emojis && emojis[index]) || ""} - <@&${role}> - ${
                        (labels && labels[index]) || " "
                      }`
                  )
                  .join("\n\n")}
								`
                ),
              ],
              components: components,
            });
          });
          interaction.reply({
            content: "Panel updated!",
          });
          await sendLogs(interaction.guild, "selfrole-setup", {
            description: `${interaction.user} edited a self role panel in ${interaction.message.url}`,
            color: "Aqua",
            avatarURL: interaction.user.displayAvatarURL(),
            username: interaction.user.username,
          });
        }
        break;
      case "delete":
        {
          const messageId = options.getString("id").trim();
          const srData = await srDb.findOne({
            guildId: guild.id,
            messageId,
          });
          if (!srData) {
            return interaction.reply({
              content: "Self role panel not found",
            });
          }
          const channel = guild.channels.cache.get(srData.channelId);
          if (!channel) {
            return interaction.reply({
              content: "Self role panel not found",
            });
          }
          interaction.reply({
            content: "Are you sure you want to delete this panel?",
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`confirm-delete-${messageId}`)
                  .setLabel("Yes")
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId(`cancel-delete-${messageId}`)
                  .setLabel("No")
                  .setStyle(ButtonStyle.Secondary)
              ),
            ],
          });
          const filter = (i) => i.user.id === interaction.user.id;
          const collector = interaction.channel.createMessageComponentCollector(
            {
              filter,
              time: 15 * 1000,
            }
          );
          collector.on("collect", async (i) => {
            if (i.customId === `confirm-delete-${messageId}`) {
              await channel.messages.fetch(messageId).then(async (msg) => {
                msg.delete();
              });
              await srDb.deleteOne({
                guildId: guild.id,
                messageId,
              });
              interaction.editReply({
                content: "Panel deleted!",
                components: [],
              });
              await sendLogs(interaction.guild, "selfrole-setup", {
                description: `${interaction.user} deleted a self role panel in <#${srData.channelId}>`,
                color: "Red",
                avatarURL: interaction.user.displayAvatarURL(),
                username: interaction.user.username,
              });
              collector.stop("deleted");
            } else if (i.customId === `cancel-delete-${messageId}`) {
              interaction.editReply({
                content: "Action cancelled!",
                components: [],
              });
              collector.stop("canceled");
            }
          });
          collector.on("end", (collected, reason) => {
            if (reason === "time") {
              interaction.editReply({
                content: "Action cancelled!",
                components: [],
              });
            }
          });
        }
        break;
      case "list": {
        const srData = await srDb.find({
          guildId: guild.id,
        });

        if (!srData) {
          return interaction.reply({
            content: "This server has no panels",
          });
        }
        const panels = [];
        srData.forEach((panel) => {
          panels.push({
            messageId: panel.messageId,
            channelId: panel.channelId,
            roles: panel.roles
              .map(
                (role) =>
                  `\n- ${`_${role.roleLabel}_` || ""}: ${
                    role.roleEmoji || ""
                  } <@&${role.roleId}>`
              )
              .join(""),
            limit: panel.limit,
            allowMultiple: panel.allowMultiple,
            type: panel.method,
          });
        });
        const embed = new EmbedBuilder()
          .setTitle("Self Role Panels")
          .setColor("DarkButNotBlack")
          .addFields(
            panels.map((panel) => {
              return {
                name: `**Message ID:** ${panel.messageId}`,
                value: `**Channel:** <#${panel.channelId}>\n**Roles:** ${
                  panel.roles
                }\n**Limit:** ${panel.limit}\n**Allow Multiple:** ${
                  panel.allowMultiple
                }\n**Type:** **${panel.type.toUpperCase()}**\n`,
                inline: true,
              };
            })
          );
        await interaction.reply({
          embeds: [embed],
        });
      }
    }
    async function checkRoles(roles) {
      console.log(roles);
      let dangerRoles = [];
      let unmanagedRoles = [];
      roles.forEach((role) => {
        const r = guild.roles.cache.get(role);
        console.log(r.name);
        const dangerPerms = [
          PermissionFlagsBits.ManageRoles,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ModerateMembers,
          PermissionFlagsBits.Administrator,
          PermissionFlagsBits.ManageGuild,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.KickMembers,
        ];
        if (r.permissions.any(dangerPerms)) {
          dangerRoles.push(role);
        } else if (!r || !r.editable || r.managed) {
          unmanagedRoles.push(role);
        }
      });
      return { dangerRoles, unmanagedRoles };
    }
  },
};
