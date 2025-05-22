const gDb = require("../schemas/guild");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  Guild,
} = require("discord.js");
const ExtendedClient = require("../class/ExtendedClient");
/**
 *
 * @param {ExtebdedClient} client
 * @param {Guild} guild
 * @param {String} category
 * @returns
 */
async function getCommands(client, guild, category) {
  try {
    let gData = await gDb.findOne({ guildId: guild.id });
    if (!gData) {
      await gDb.create({
        guildId: guild.id,
      });
      gData = await gDb.findOne({ guildId: guild.id });
    }
    let commands = client.collection.interactioncommands
      .filter((v) => !v.developers && v.category === category)
      .map((v) => {
        return {
          name: v.structure?.name,
          category: v.category,
          description: v.structure.description || "No description provided",
          usage: v.usage || "No usage provided",
          premium: v.premium || 0,
        };
      });
    return commands;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { getCommands };
