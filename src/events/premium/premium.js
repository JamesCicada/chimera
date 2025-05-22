const moment = require("moment");
const {
  Interaction,
  Client,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  EmbedBuilder,
  TextInputStyle,
  WebhookClient,
} = require("discord.js");
const gDb = require("../../schemas/guild");

module.exports = {
  event: "interactionCreate",
  /**
   * @param {Interaction} interaction
   * @param {Client} client
   */
  run: async (client, interaction) => {
    try {
      const logsHook = new WebhookClient({
        url: process.env.premlogshook,
      });
      if (!interaction.customId) return;
      if (interaction.member.id !== "370995733509177355") return;
      console.log(interaction.customId);
      const option = interaction.customId;
      switch (option) {
        case "Add-Premium":
          {
            const guildId = new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("guildId")
                .setLabel("Guild ID")
                .setRequired(true)
                .setPlaceholder("Enter Guild ID")
                .setStyle(TextInputStyle.Short)
            );

            const premiumType = new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("premiumType")
                .setLabel("Premium Type")
                .setPlaceholder("Select Premium Type")
                .setStyle(TextInputStyle.Short)
            );
            const duration = new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("duration")
                .setLabel("Duration")
                .setPlaceholder("Select Duration in months")
                .setStyle(TextInputStyle.Short)
            );
            const premiumModal = new ModalBuilder()
              .setCustomId("premiumModal")

              .setTitle("Add Premium")
              .addComponents(guildId, premiumType, duration);
            await interaction.showModal(premiumModal);
          }
          break;
        case "premiumModal": {
          const guildId = interaction.fields.getTextInputValue("guildId");
          const premiumType =
            interaction.fields.getTextInputValue("premiumType");
          const duration = interaction.fields.getTextInputValue("duration");
          let guild = client.guilds.cache.get(guildId);
          let gData = await gDb.findOne({ guildId: guildId });
          if (!gData) {
            await gDb.create({
              guildId: guildId,
              premium: false,
              premiumType: "None",
              premiumDuration: 0,
            });
            gData = await gDb.findOne({ guildId: guildId });
          }
          const durMonths = moment().add(duration, "M");
          console.log(durMonths);
          const embed = new EmbedBuilder()
            .setTitle("Premium Added")
            .setDescription(
              `
              > Guild: ${guild.name} (${guild.id})

              > Premium Type: ${premiumType}

              > Duration: ${duration} months

              > Start Date: <t:${
                gData.premium && gData.premium["status"]
                  ? moment(gData.premium["start"]).unix()
                  : moment().unix()
              }:R>

              > End Date: <t:${durMonths.unix()}:R>
              `
            )
            .setColor("Green");
          // const updates = {
          //   started: `${gData.premium && gData.premium['status'] ? gData.premium['start'] : moment().unix()}`,
          //   status: true,
          //   end: `${durMonths.unix()}`,
          //   type: premiumType
          // }
          let data = await gDb.findOneAndUpdate(
            { guildId: guildId },
            {
              $set: {
                premium: {
                  status: true,
                  started: `${
                    gData.premium && gData.premium["status"]
                      ? gData.premium["start"]
                      : moment().unix()
                  }`,
                  end: `${durMonths.unix()}`,
                  tier: premiumType,
                },
              },
            }
          );
          interaction.reply({
            content: "Premium Added",
            ephemeral: true,
          });
          console.log(data);

          await logsHook.send({
            username: "Chimera Premium",
            avatarURL: client.user.displayAvatarURL({ dynamic: true }),
            embeds: [embed],
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
