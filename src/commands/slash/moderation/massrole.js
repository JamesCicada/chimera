const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { sendLogs } = require("../../../Functions/actionLogs");
const Duration = require("duration-js");
module.exports = {
  category: "moderation",
  usage: "massrole [type] [add/remove] [role]",
  mod: true,
  structure: new SlashCommandBuilder()
    .setName("massrole")
    .setDescription("add/remove a role to humans or bots or both")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("add or remove a role")
        .setRequired(true)
        .addChoices(
          { name: "add", value: "add" },
          { name: "remove", value: "remove" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("filter")
        .setDescription("humans or bots or all")
        .setRequired(true)
        .addChoices(
          { name: "humans", value: "humans" },
          { name: "bots", value: "bots" },
          { name: "all", value: "all" }
        )
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("the role that you wanna add or remove")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: async (client, interaction) => {
        const { guild } = interaction;
    const action = interaction.options.getString("action");
    const type = interaction.options.getString("filter");
    const role = interaction.options.getRole("role");

    try {
      const isValid = await checkRoles(guild, role.id);
      if (isValid === "unmanaged") {
        return interaction.reply({
          content: `I can't manage this ${role}`,
          ephemeral: true,
        });
      }
      if (isValid === "danger" && action === "add") {
        return interaction.reply({
          content: `Role has dangerous permissions and can't be mass added`,
          ephemeral: true,
        });
      }

      // Fetch all members instead of using cache
      await guild.members.fetch();
      let targets;
      switch (type) {
        case "humans":
          targets = guild.members.cache.filter((m) => !m.user.bot);
          break;
        case "bots":
          targets = guild.members.cache.filter((member) => member.user.bot);
          break;
        case "all":
          targets = guild.members.cache;
          break;
      }

      // Filter targets based on role presence
      targets = targets.filter(
        (member) => action === "add" 
          ? !member.roles.cache.has(role.id)
          : member.roles.cache.has(role.id)
      );

      if (targets.size === 0) {
        return interaction.reply({
          content: `No ${type} to ${action} ${role}`,
          ephemeral: true,
        });
      }

      // Convert collection to array and chunk it
      const membersArray = [...targets.values()];
      const chunkSize = 100;
      const memberChunks = [];
      for (let i = 0; i < membersArray.length; i += chunkSize) {
        memberChunks.push(membersArray.slice(i, i + chunkSize));
      }

      await interaction.reply({
        content: `${action === "add" ? "Adding" : "Removing"} ${role} to ${type} (${targets.size} members). ETA: ${new Duration(targets.size * 1000).toString()}`,
      });

      let processed = 0;
      const startTime = Date.now();

      for (const chunk of memberChunks) {
        const promises = chunk.map(async (member) => {
          try {
            if (action === "add") {
              await member.roles.add(role, `Mass Role add by ${interaction.user.username}`);
            } else {
              await member.roles.remove(role, `Mass Role removal by ${interaction.user.username}`);
            }
            processed++;
          } catch (error) {
            console.error(`Error processing member ${member.id}:`, error);
          }
        });

        await Promise.all(promises);
        // Wait 1 second between chunks to avoid rate limits
        if (memberChunks.indexOf(chunk) < memberChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const timeTaken = new Duration(Date.now() - startTime).toString();
      await interaction.editReply({
        content: `${action === "add" ? "Added" : "Removed"} ${role} to ${processed} ${type} in ${timeTaken}!`,
      });

      await sendLogs(guild, `massrole ${action}`, {
        username: interaction.user.username,
        avatarURL: interaction.user.displayAvatarURL(),
        color: action === "add" ? "Green" : "Red",
        description: `${action === "add" ? "Added" : "Removed"} ${role} to ${processed} ${type} in ${timeTaken}\n by ${interaction.user.username}`,
      });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `There was an error please check my permissions`,
        ephemeral: true,
      });
    }
  }
};

async function checkRoles(guild, roleId) {
  const role = guild.roles.cache.get(roleId);
  if (!role) return "unmanaged";

  const dangerPerms = [
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers,
  ];

  if (role.permissions.any(dangerPerms)) {
    return "danger";
  }
  if (!role.editable || role.managed) {
    return "unmanaged";
  }
  return "safe";
}