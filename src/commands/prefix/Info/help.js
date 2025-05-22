const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Message,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/guild");
const { getCommands } = require("../../../Functions/getHelp");
const commandCats = require("../../../Functions/commandCats");
module.exports = {
  structure: {
    category: "utility",
    name: "help",
    description: "get the help menu",
    aliases: ["h", "commands"],
    cooldown: 15000,
  },

  /**
   * @param {ExtendedClient} client
   * @param {Message} message
   */
  run: async (client, message, args) => {
    let prefix = config.handler.prefix;
    let status = false;

    if (config.handler?.mongodb?.enabled) {
      try {
        const data = await GuildSchema.findOne({
          guildId: message.guildId,
        });

        if (data && data?.prefix) {
          status = data.prefixStatus;
          prefix = data.prefix;
        }
      } catch {
        prefix = config.handler.prefix;
      }
    }
    const cats = [];
    for (const [k, v] of Object.entries(commandCats)) {
      cats.push({
        label: v.name,
        value: v.name.toLocaleLowerCase(),
        emoji: v.emoji,
        image: v.image,
      });
    }
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .addOptions(
          cats.map((v) => {
            return { label: v.label, value: v.value, emoji: v.emoji };
          })
        )
        .setCustomId("help-menu")
        .setPlaceholder("Select a Category")
    );
    const embed = new EmbedBuilder().setImage(client.user.displayAvatarURL()).setColor("Blurple").setDescription(`
		  > Use the Menu below to select a category.
  
		  > **Prefix is:** \`${prefix.replace(/\\/g, "\\\\").replace("`", "`")}\`
  
		  > **Prefix Status:** ${status ? "Enabled" : "Disabled"}
		  `);
    message.reply({ embeds: [embed], components: [menu] }).then((msg) => {
      const filter = (i) => i.user.id === message.author.id;
      const collector = msg.channel.createMessageComponentCollector({
        filter,
        time: 60 * 1000,
      });
      collector.on("collect", async (i) => {
        if (i.customId === "help-menu") {
          i.deferUpdate();
          const commands = await getCommands(
            client,
            message.guild,
            i.values[0]
          );
          if (commands.length === 0)
            return await msg.edit({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`No commands in this category.`)
                  .setColor("Red"),
              ],
              ephemeral: true,
            });
          await msg.edit({
            embeds: [
              new EmbedBuilder()
                .setTitle(`${i.values[0]} Commands`)
                .setColor("Aqua")
                .setThumbnail(
                  client.user.displayAvatarURL({ size: 1024, dynamic: true })
                )
                .setDescription(
                  commands
                    .map((v) => {
                      if (
                        v !== undefined &&
                        v.name !== undefined &&
                        v.description
                      ) {
                        return `**${v.name}:** ${v.description}\n - \`${v.usage}\``;
                      }
                    })
                    .join("\n\n")
                ),
            ],
          });
        }
      });
      collector.on("end", () => {
        msg.edit({ components: [] });
      });
    });
  },
};
