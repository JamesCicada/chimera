const guildDb = require("../../schemas/guild");
const moment = require("moment");
const {
  Interaction,
  Client,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const srDb = require("../../schemas//selfrole");
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
      if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;
      if (interaction.customId.startsWith("selfrole")) {
        if (interaction.isStringSelectMenu()) {
          const srData = await srDb.findOne({
            guildId: interaction.guild.id,
            messageId: interaction.message.id,
          });
          if (!srData) return;
          const limit = srData.limit;
          const multiple = srData.allowMultiple;
          if (!multiple) {
            if (interaction.values.length > 1) {
              return interaction.reply({
                content: `You can only select 1 options`,
                ephemeral: true,
              });
            }
          }
          if (limit && interaction.values.length > limit) {
            return interaction.reply({
              content: `You can only select ${limit} options`,
              ephemeral: true,
            });
          }
          let roles = srData.roles.map((role) => {
            return role.roleId;
          });
          let matching = [];
          if (!multiple && interaction.member.roles.cache.hasAny(roles)) {
            interaction.member.roles.cache.each((role) => {
              if (roles.includes(role.id)) {
                matching.push(role.id);
              }
            });
            member.roles.remove(matching, [
              `Selfrole does not allow multiple roles`,
            ]);
          }
          const { dangerRoles, unmanagedRoles } = await checkRoles(
            interaction.values
          );
          if (dangerRoles.length > 0) {
            return interaction.reply({
              content: `Following roles have dangerous permissions and cannot be given through self role: ${dangerRoles
                .map((r) => `<@&${r}>`)
                .join(", ")}`,
              ephemeral: true,
            });
          }
          if (unmanagedRoles.length > 0) {
            return interaction.reply({
              content: `Following roles are not managed by the bot and cannot be given through self role: ${unmanagedRoles
                .map((r) => `<@&${r}>`)
                .join(", ")}`,
              ephemeral: true,
            });
          }
          let addedRoles = [];
          let removedRoles = [];
          for (const role of interaction.values) {
            if (!member.roles.cache.has(role)) {
              member.roles.add(role, ["Chimera selfrole"]);
              addedRoles.push(role);
            } else {
              member.roles.remove(role, ["Chimera selfrole"]);
              removedRoles.push(role);
            }
          }
          interaction.reply({
            content: `${
              addedRoles.length > 0
                ? `Added roles: ${addedRoles.map((r) => `<@&${r}>`).join(", ")}`
                : ""
            }\n${
              removedRoles.length > 0
                ? `Removed roles: ${removedRoles
                    .map((r) => `<@&${r}>`)
                    .join(", ")}`
                : ""
            }`,
            ephemeral: true,
          });
          await sendLogs(interaction.guild, "selfrole", {
            description: `${interaction.user} used self role on ${
              interaction.message.url
            }\n > Added roles: ${addedRoles
              .map((r) => `<@&${r}>`)
              .join(", ")}\n > Removed roles: ${removedRoles
              .map((r) => `<@&${r}>`)
              .join(", ")}\n type: Select Menu`,
            color: "DarkAqua",
            avatarURL: interaction.user.displayAvatarURL(),
            username: interaction.user.username,
          });
          // now we update the interaction select menu so the member can select any role again
          interaction.message.edit({
            content: "",
          });
        } else if (interaction.isButton()) {
          const srData = await srDb.findOne({
            guildId: interaction.guild.id,
            messageId: interaction.message.id,
          });
          if (!srData) return;
          const { dangerRoles, unmanagedRoles } = await checkRoles([
            interaction.customId.split("-")[1],
          ]);
          if (dangerRoles.length > 0) {
            return interaction.reply({
              content: `Following roles have dangerous permissions and cannot be given through self role: ${dangerRoles
                .map((r) => `<@&${r}>`)
                .join(", ")}`,
              ephemeral: true,
            });
          }
          if (unmanagedRoles.length > 0) {
            return interaction.reply({
              content: `Following roles are not managed by the bot and cannot be given through self role: ${unmanagedRoles
                .map((r) => `<@&${r}>`)
                .join(", ")}`,
              ephemeral: true,
            });
          }
          let counter = srData.counter;
          let roleId = interaction.customId.split("-")[1];
          let currentCount = interaction.guild.members.cache.filter((m) =>
            m.roles.cache.has(roleId)
          ).size;
          console.log(currentCount);
          if (!srData.allowMultiple) {
            if (
              interaction.member.roles.cache.some((r) =>
                srData.roles.map((r) => r.roleId).includes(r.id)
              ) &&
              !interaction.member.roles.cache.hasAny(roleId)
            )
              return interaction.reply({
                content:
                  "This selfrole panel only allows 1 role, remove one before adding a new",
                ephemeral: true,
              });
          }
          if (!interaction.member.roles.cache.has(roleId)) {
            interaction.member.roles.add(roleId, ["Chimera selfrole"]);
            interaction.reply({
              content: `Added role: <@&${roleId}>`,
              ephemeral: true,
            });
            if (counter) {
              let updatedButtons = [];
              interaction.message.components[0].components.forEach((button) => {
                if (button.customId.split("-")[1] == roleId) {
                  let currentLabel = button.data.label;
                  let cleanLabel = currentLabel.replace(/\(\d+\)/, (match) => {
                    currentCount = parseInt(match.slice(1, -1));
                    return "";
                  });

                  // Increment currentCount and add it to the clean label
                  let newLabel = `${cleanLabel} (${currentCount + 1})`;
                  button.data.label = newLabel;
                  updatedButtons.push(button);
                } else {
                  updatedButtons.push(button);
                }
              });
              await interaction.message
                .edit({
                  components: [
                    new ActionRowBuilder().addComponents(updatedButtons),
                  ],
                })
                .catch((e) => console.log(e));
            }
            await sendLogs(interaction.guild, "selfrole", {
              description: `${interaction.user} used self role on ${interaction.message.url}\n > Added role: <@&${roleId}>\n type: Button`,
              color: "DarkAqua",
              avatarURL: interaction.user.displayAvatarURL(),
              username: interaction.user.username,
            });
          } else {
            interaction.member.roles.remove(roleId, ["Chimera selfrole"]);
            interaction.reply({
              content: `Removed role: <@&${roleId}>`,
              ephemeral: true,
            });
            if (counter) {
              let updatedButtons = [];
              interaction.message.components[0].components.forEach((button) => {
                if (button.customId.split("-")[1] == roleId) {
                  console.log(button);
                  let currentLabel = button.data.label;
                  let cleanLabel = currentLabel.replace(/\(\d+\)/, (match) => {
                    currentCount = parseInt(match.slice(1, -1));
                    return "";
                  });

                  // Increment currentCount and add it to the clean label
                  let newLabel = `${cleanLabel} (${currentCount - 1})`;
                  button.data.label = newLabel;
                  updatedButtons.push(button);
                } else {
                  updatedButtons.push(button);
                }
              });
              await interaction.message
                .edit({
                  components: [
                    new ActionRowBuilder().addComponents(updatedButtons),
                  ],
                })
                .catch((e) => console.log(e));
            }

            await sendLogs(interaction.guild, "selfrole", {
              description: `${interaction.user} used self role on ${interaction.message.url}\n > Removed role: <@&${roleId}>\n type: Button`,
              color: "DarkAqua",
              avatarURL: interaction.user.displayAvatarURL(),
              username: interaction.user.username,
            });
          }
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
    } catch (err) {
      console.error(err);
    }
  },
};
