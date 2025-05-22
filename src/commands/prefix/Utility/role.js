const {
    Client,
    SlashCommandBuilder,
    PermissionFlagsBits,
    Message,
  } = require("discord.js");
  const colors = require("hex-to-color-name");
  const moment = require("moment");
  module.exports = {
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
     * @param {Message} message
     * @param {Client} client
     */
    run: async (client, message, args) => {
        const interaction = message;
      try {
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if(!role) return message.reply({content: `Please specify a role!`});
        let color = parseInt(role.hexColor.replace("#", "0x"), 16);
        let arrowEmoji = '<:chimera_arrowwhite:1189611797880250420>';
        let roleAge = moment(role.createdAt).format("MMMM Do YYYY, h:mm:ss a");
        let perms = role.permissions.has(PermissionFlagsBits.Administrator) ? 'Administrator' : role.permissions.toArray().join("\n")
        let size = role.members.size
        console.log(size);
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
          **Role Members:** ${size}
          **Role Permissions:** ${"```"}--\n${perms}${"```"}`,
          color: color,
          thumbnail: {
            url: `https://dummyimage.com/100/${role.hexColor.replace(
              "#",
              ""
            )}/ffffff.png&text=Chimera`,
          },
          footer: {
            text: `Requested by ${interaction.author.tag}`,
            icon_url: interaction.author.displayAvatarURL(),
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
  