const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
//const randomColor = require("randomcolor");
const colors = require("hex-to-color-name");
const moment = require("moment");
module.exports = {
  category: 'utility',
  usage: "role [role]",
  structure: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Information About a role")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role you want to check")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: async (client, interaction) => {
    try {
      let role = interaction.options.getRole("role");
      let color = parseInt(role.hexColor.replace("#", "0x"), 16);
      let arrowEmoji = '<:chimera_arrowwhite:1189611797880250420>';
      let colorName = colors(role.hexColor);
      let roleAge = moment(role.createdAt).format("MMMM Do YYYY, h:mm:ss a");
      let perms = role.permissions.has(PermissionFlagsBits.Administrator) ? 'Administrator' : role.permissions.toArray().join("\n")
      if (!role.permissions) {
        perms = 'none'
      }
      let embed = {
        title: `Role Info for ${role.name}`,
        description: `**Role Name:** ${role.name}
        **Role ID:** ${role.id}
        **Role Color:** ${role.hexColor}
        **Role Created at:** ${roleAge} (from the bottom)
        **Role Position:** ${role.position}
        **Role Hoisted:** ${role.hoist}
        **Role Mentionable:** ${role.mentionable}
        **Role Permissions:** ${"```"}--\n${perms}${"```"}`,
        color: color,
        thumbnail: {
          url: `https://dummyimage.com/100/${role.hexColor.replace(
            "#",
            ""
          )}/ffffff.png&text=${arrowEmoji}`,
        },
        footer: {
          text: `Requested by ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
      };
      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: `There was an error please check my permissions`,
        ephemeral: true,
      });
    }
  },
};
