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
const fs = require("fs");
const loadEvents = require("../../handlers/events");
const loadCommands = require("../../handlers/commands");
const { sendLogs } = require("../../Functions/actionLogs");
//const guildSettings = require("../../schemas/guildSettings");
/**
 * @param {Interaction} interaction
 * @param {Client} client
 */
module.exports = {
  event: "interactionCreate",
  run: async (client, interaction) => {
    try {
      const { guild, customId } = interaction;
      let onEmoji = "<:chimera_switchon:1189609942567616512>";
      let offEmoji = "<:chimera_switchoff:1189610234587664534>";
      if (!interaction.isButton()) return;
      let guildData = guildDb.findOne({
        guildId: interaction.guild.id,
      });
      if (!guildData) {
        await guildDb
          .create({
            guildId: interaction.guild.id,
          })
          .then(() => {
            console.log(`added ${interaction.guild.id} to database`);
          });
      }
      guildData = await guildDb.findOne({
        guildId: interaction.guild.id,
      });
      switch (interaction.customId) {
        case "verifyButton":
          let verifyRole = guildData.verifiedRole;
          if (interaction.member.roles.cache.has(verifyRole))
            return interaction.reply({
              content: "You're already Verified",
              ephemeral: true,
            });
          const buttonOptions = [
            { emoji: "💎", value: "itemDiamond" }, // 1
            { emoji: "⚽", value: "itemFootball" }, // 2
            { emoji: "🎮", value: "itemController" }, // 3
            { emoji: "❤", value: "itemHeart" }, // 4
            { emoji: "🚗", value: "itemCar" }, // 5
            { emoji: "⭐", value: "itemStar" }, // 6
            { emoji: "🧽", value: "itemSponge" }, // 7
            { emoji: "🌈", value: "itemRainbow" }, // 8
            { emoji: "🍕", value: "itemPizza" }, // 9
            { emoji: "🎈", value: "itemBalloon" }, // 10
            { emoji: "📖", value: "itemBook" }, // 11
            { emoji: "🍎", value: "itemApple" }, // 12
            { emoji: "🎸", value: "itemGuitar" }, // 13
            { emoji: "🚀", value: "itemRocket" }, // 14
            { emoji: "🌟", value: "itemSparkle" }, // 15
            { emoji: "🍔", value: "itemBurger" }, // 16
            { emoji: "🎨", value: "itemPalette" }, // 17
            { emoji: "🐱", value: "itemCat" }, // 18
            { emoji: "🎯", value: "itemTarget" }, // 19
            { emoji: "⛵", value: "itemBoat" }, // 20
            { emoji: "🍦", value: "itemIceCream" }, // 21
            { emoji: "🌺", value: "itemFlower" }, // 22
            { emoji: "🎲", value: "itemDice" }, // 23
            { emoji: "🏰", value: "itemCastle" }, // 24
            { emoji: "🎁", value: "itemGift" }, // 25
          ];
          if (
            guildData.verificationStatus ||
            guildData.verificationStatus == true
          ) {
            const shuffledOptions = buttonOptions.sort(
              () => Math.random() - 0.5
            );
            const rows = [];
            for (let i = 0; i < shuffledOptions.length; i += 5) {
              const rowButtons = shuffledOptions
                .slice(i, i + 5)
                .map((option) =>
                  new ButtonBuilder()
                    .setCustomId(option.value)
                    .setEmoji(option.emoji)
                    .setStyle(2)
                );
              rows.push(new ActionRowBuilder().addComponents(...rowButtons));
            }
            let correct =
              buttonOptions[Math.floor(Math.random() * buttonOptions.length)];
            let correctAnswer = correct.value;
            interaction
              .reply({
                content: `# click on the _\`${correctAnswer.replace(
                  "item",
                  ""
                )}\`_ Emoji to get verified`,
                ephemeral: true,
                components: rows,
              })
              .then((msg) => {
                const filter = (i) => {
                  return i.customId.startsWith("item");
                };
                const collector =
                  interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 1000 * 15,
                  });
                collector.on("collect", async (i) => {
                  if (i.customId.startsWith("item")) {
                    if (i.member.id != interaction.member.id) return;
                    let answer = i.customId;
                    if (answer == correctAnswer) {
                      await i.deferUpdate();
                      const { dangerRoles, unmanagedRoles } = await checkRoles([
                        verifyRole,
                      ]);
                      if (dangerRoles.length > 0) {
                        await sendLogs(i.guild, "verification", {
                          description: `Please fix the following roles, They have dangerous permissions: ${dangerRoles.join(
                            ", "
                          )}`,
                          color: "Red",
                          avatarURL: i.user.displayAvatarURL(),
                          username: i.user.username,
                          content: "@here",
                        });
                        return i.editReply({
                          content: `You can't have roles with the following permissions: ${dangerRoles.join(
                            ", "
                          )}`,
                          ephemeral: true,
                          components: [],
                        });
                      }
                      if (unmanagedRoles.length > 0) {
                        await sendLogs(i.guild, "verification", {
                          description: `Please fix the following roles, The bot can't manage them: ${unmanagedRoles.join(
                            ", "
                          )}`,
                          color: "Red",
                          avatarURL: i.user.displayAvatarURL(),
                          username: i.user.username,
                          content: "@here",
                        });
                        return i.editReply({
                          content: `You can't have unmanaged roles: ${unmanagedRoles.join(
                            ", "
                          )}`,
                          ephemeral: true,
                          components: [],
                        });
                      }
                      await i.member.roles.add(verifyRole, [
                        "Passed the verification challenge",
                      ]);
                      await sendLogs(i.guild, "verification", {
                        description: `${i.user} has passed the verification challenge`,
                        color: "Green",
                        avatarURL: i.user.displayAvatarURL(),
                        username: i.user.username,
                      });
                      const unverified = i.guild.roles.cache.find((r) =>
                        r.name.toLowerCase().includes("unverified")
                      );
                      await i.member.roles
                        .remove(unverified, [
                          "Passed the verification challenge",
                        ])
                        .catch((err) => {
                          console.log;
                        });
                      await i
                        .editReply({
                          content: `you have been verified`,
                          components: [],
                        })
                        .catch((e) => console.log(e));
                    } else {
                      await i.deferUpdate();
                      await i
                        .editReply({
                          content: `Wrong Answer You can Try Again!`,
                          components: [],
                        })
                        .catch((e) => console.log(e));
                    }

                    collector.stop();
                  }
                });
                collector.on("end", (collected) => {
                  if (collected.size === 0) {
                    interaction.editReply({
                      content: "The Time is Up",
                      components: [],
                    });
                  }
                });
              });
          }
          break;
        case "welcome-toggle":
          {
            if (
              interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
              )
            ) {
              let guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              if (!guildData) {
                await guildDb.create({
                  guildId: interaction.guild.id,
                });
              }
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              let welcomeStatus = guildData.welcomeStatus;
              let byeStatus = guildData.byeStatus;
              let logsStatus = guildData.logsStatus;
              let boostStatus = guildData.boostStatus;
              let botsWlStatus = guildData.botsWlStatus;
              let prefixStatus = guildData.prefixStatus;
              var embedTemp = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setThumbnail(client.user.displayAvatarURL());
              let welcomeColor = welcomeStatus ? 3 : 4;
              let byeColor = byeStatus ? 3 : 4;
              let logsColor = logsStatus ? 3 : 4;
              let boostColor = boostStatus ? 3 : 4;
              let botWlColor = botsWlStatus ? 3 : 4;
              let prefixColor = prefixStatus ? 3 : 4;
              // let newStatus = welcomeStatus ? false : true
              if (
                !guildData.welcomeChannel ||
                !guildData.welcomeImages ||
                !guildData.welcomeMessage
              )
                return interaction.reply({
                  content:
                    "There are more settings you need to setup before being able to turn on this feature use `/setup welcoming` to set them up",
                  ephemeral: true,
                });
              await guildData.updateOne({
                welcomeStatus: !welcomeStatus,
              });
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              welcomeStatus = guildData.welcomeStatus;
              byeStatus = guildData.byeStatus;
              logsStatus = guildData.logsStatus;
              welcomeColor = welcomeStatus ? 3 : 4;
              byeColor = byeStatus ? 3 : 4;
              logsColor = logsStatus ? 3 : 4;
              boostColor = boostStatus ? 3 : 4;
              botWlColor = botsWlStatus ? 3 : 4;
              prefixColor = prefixStatus ? 3 : 4;
              // newStatus = welcomeStatus ? true : false
              let buttons = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("welcome-toggle")
                    .setLabel("Welcoming")
                    .setStyle(welcomeColor),
                  new ButtonBuilder()
                    .setCustomId("bye-toggle")
                    .setLabel("Leaving")
                    .setStyle(byeColor),
                  new ButtonBuilder()
                    .setCustomId("logs-toggle")
                    .setLabel("Logs")
                    .setStyle(logsColor)
                ),
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("boost-toggle")
                    .setLabel("Boost Alerts")
                    .setStyle(boostColor),
                  new ButtonBuilder()
                    .setCustomId("botwl-toggle")
                    .setLabel("Bots Whitelist")
                    .setStyle(botWlColor),
                  new ButtonBuilder()
                    .setCustomId("prefix-toggle")
                    .setLabel("Prefix Whitelist")
                    .setStyle(prefixColor)
                ),
              ];
              interaction.deferUpdate();
              interaction.message.edit({
                embeds: [
                  embedTemp
                    .setTitle("Features Control Panel")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`
                                > Welcoming Status: ${
                                  welcomeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Leaving Status: ${
                                  byeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Logs Status: ${
                                  logsStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                                
                                > Boosting Status: ${
                                  boostStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Bots Whitelist Status: ${
                                  botsWlStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Prefix Status: ${
                                  prefixStatus
                                    ? `**ON** ${onEmoji} \`${
                                        guildData.prefix || "!"
                                      }\``
                                    : `**OFF** ${offEmoji}`
                                }
                                            `),
                ],
                components: buttons,
              });
              await sendLogs(i.guild, "Feature", {
                description: `${i.user} turned ${
                  welcomeStatus ? "on" : "off"
                } welcoming feature`,
                color: "Green",
                avatarURL: i.user.displayAvatarURL(),
                username: i.user.username,
              });
            }
          }
          break;
        case "bye-toggle":
          {
            if (
              interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
              )
            ) {
              let guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              if (!guildData) {
                await guildDb.create({
                  guildId: interaction.guild.id,
                });
              }
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              let welcomeStatus = guildData.welcomeStatus;
              let byeStatus = guildData.byeStatus;
              let logsStatus = guildData.logsStatus;
              let boostStatus = guildData.boostStatus;
              let botsWlStatus = guildData.botsWlStatus;
              let prefixStatus = guildData.prefixStatus;
              var embedTemp = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setThumbnail(client.user.displayAvatarURL());
              let welcomeColor = welcomeStatus ? 3 : 4;
              let byeColor = !byeStatus ? 3 : 4;
              let logsColor = logsStatus ? 3 : 4;
              let newStatus = byeStatus ? false : true;
              if (
                !guildData.byeChannel ||
                !guildData.byeImages ||
                !guildData.byeMessage
              )
                return interaction.reply({
                  content:
                    "There are more settings you need to setup before being able to turn on this feature use `/setup leaving` to set them up",
                  ephemeral: true,
                });
              await guildData.updateOne({
                byeStatus: newStatus,
              });
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              welcomeStatus = guildData.welcomeStatus;
              byeStatus = guildData.byeStatus;
              logsStatus = guildData.logsStatus;
              welcomeColor = welcomeStatus ? 3 : 4;
              byeColor = byeStatus ? 3 : 4;
              logsColor = logsStatus ? 3 : 4;
              boostColor = boostStatus ? 3 : 4;
              botWlColor = botsWlStatus ? 3 : 4;
              prefixColor = prefixStatus ? 3 : 4;
              newStatus = byeStatus ? true : false;
              let buttons = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("welcome-toggle")
                    .setLabel("Welcoming")
                    .setStyle(welcomeColor),
                  new ButtonBuilder()
                    .setCustomId("bye-toggle")
                    .setLabel("Leaving")
                    .setStyle(byeColor),
                  new ButtonBuilder()
                    .setCustomId("logs-toggle")
                    .setLabel("Logs")
                    .setStyle(logsColor)
                ),
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("boost-toggle")
                    .setLabel("Boost Alerts")
                    .setStyle(boostColor),
                  new ButtonBuilder()
                    .setCustomId("botwl-toggle")
                    .setLabel("Bots Whitelist")
                    .setStyle(botWlColor),
                  new ButtonBuilder()
                    .setCustomId("prefix-toggle")
                    .setLabel("Prefix Whitelist")
                    .setStyle(prefixColor)
                ),
              ];
              interaction.deferUpdate();
              interaction.message.edit({
                embeds: [
                  embedTemp
                    .setTitle("Features Control Panel")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`
                                > Welcoming Status: ${
                                  welcomeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Leaving Status: ${
                                  byeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Logs Status: ${
                                  logsStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                                
                                > Boosting Status: ${
                                  boostStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Bots Whitelist Status: ${
                                  botsWlStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Prefix Status: ${
                                  prefixStatus
                                    ? `**ON** ${onEmoji} \`${
                                        guildData.prefix || "!"
                                      }\``
                                    : `**OFF** ${offEmoji}`
                                }
                                            `),
                ],
                components: buttons,
              });
              await sendLogs(i.guild, "Feature", {
                description: `${i.user} turned ${
                  byeStatus ? "on" : "off"
                } Bye feature`,
                color: "Green",
                avatarURL: i.user.displayAvatarURL(),
                username: i.user.username,
              });
            }
          }
          break;
        case "logs-toggle":
          {
            if (
              interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
              )
            ) {
              let guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              if (!guildData) {
                await guildDb.create({
                  guildId: interaction.guild.id,
                });
              }
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              let welcomeStatus = guildData.welcomeStatus;
              let byeStatus = guildData.byeStatus;
              let logsStatus = guildData.logsStatus;
              let boostStatus = guildData.boostStatus;
              let botsWlStatus = guildData.botsWlStatus;
              let prefixStatus = guildData.prefixStatus;
              var embedTemp = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setThumbnail(client.user.displayAvatarURL());
              let welcomeColor = welcomeStatus ? 3 : 4;
              let byeColor = byeStatus ? 3 : 4;
              let logsColor = logsStatus ? 3 : 4;
              if (!guildData.logsChannel)
                return interaction.reply({
                  content:
                    "There are more settings you need to setup before being able to turn on this feature use `/setup logs` to set them up",
                  ephemeral: true,
                });
              await guildData.updateOne({
                logsStatus: !logsStatus,
              });
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });

              welcomeStatus = guildData.welcomeStatus;
              byeStatus = guildData.byeStatus;
              logsStatus = guildData.logsStatus;
              welcomeColor = welcomeStatus ? 3 : 4;
              byeColor = byeStatus ? 3 : 4;
              logsColor = logsStatus ? 3 : 4;
              boostColor = boostStatus ? 3 : 4;
              botWlColor = botsWlStatus ? 3 : 4;
              prefixColor = prefixStatus ? 3 : 4;
              let buttons = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("welcome-toggle")
                    .setLabel("Welcoming")
                    .setStyle(welcomeColor),
                  new ButtonBuilder()
                    .setCustomId("bye-toggle")
                    .setLabel("Leaving")
                    .setStyle(byeColor),
                  new ButtonBuilder()
                    .setCustomId("logs-toggle")
                    .setLabel("Logs")
                    .setStyle(logsColor)
                ),
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("boost-toggle")
                    .setLabel("Boost Alerts")
                    .setStyle(boostColor),
                  new ButtonBuilder()
                    .setCustomId("botwl-toggle")
                    .setLabel("Bots Whitelist")
                    .setStyle(botWlColor),
                  new ButtonBuilder()
                    .setCustomId("prefix-toggle")
                    .setLabel("Prefix Whitelist")
                    .setStyle(prefixColor)
                ),
              ];
              interaction.deferUpdate();
              interaction.message.edit({
                embeds: [
                  embedTemp
                    .setTitle("Features Control Panel")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`
                                > Welcoming Status: ${
                                  welcomeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Leaving Status: ${
                                  byeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Logs Status: ${
                                  logsStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                                
                                > Boosting Status: ${
                                  boostStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Bots Whitelist Status: ${
                                  botsWlStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Prefix Status: ${
                                  prefixStatus
                                    ? `**ON** ${onEmoji} \`${
                                        guildData.prefix || "!"
                                      }\``
                                    : `**OFF** ${offEmoji}`
                                }
                                            `),
                ],
                components: buttons,
              });
            }
          }
          break;
        case "boost-toggle":
          {
            if (
              interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
              )
            ) {
              let guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              if (!guildData) {
                await guildDb.create({
                  guildId: interaction.guild.id,
                });
              }
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              let welcomeStatus = guildData.welcomeStatus;
              let byeStatus = guildData.byeStatus;
              let logsStatus = guildData.logsStatus;
              let boostStatus = guildData.boostStatus;
              let botsWlStatus = guildData.botsWlStatus;
              let prefixStatus = guildData.prefixStatus;
              var embedTemp = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setThumbnail(client.user.displayAvatarURL());
              let welcomeColor = welcomeStatus ? 3 : 4;
              let byeColor = byeStatus ? 3 : 4;
              let logsColor = logsStatus ? 3 : 4; //
              // newStatus = boostStatus ? true : false
              let boostColor = boostStatus ? 3 : 4;
              let botWlColor = botsWlStatus ? 3 : 4;
              let prefixColor = prefixStatus ? 3 : 4;
              if (!guildData.boostChannel || !guildData.boostImages)
                return interaction.reply({
                  content:
                    "There are more settings you need to setup before being able to turn on this feature use `/setup boost` to set them up",
                  ephemeral: true,
                });
              await guildData.updateOne({
                boostStatus: !boostStatus,
              });
              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              boostStatus = guildData.boostStatus;
              welcomeStatus = guildData.welcomeStatus;
              byeStatus = guildData.byeStatus;
              logsStatus = guildData.logsStatus;
              welcomeColor = welcomeStatus ? 3 : 4;
              byeColor = byeStatus ? 3 : 4;
              logsColor = logsStatus ? 3 : 4;
              boostColor = boostStatus ? 3 : 4;
              botWlColor = botsWlStatus ? 3 : 4;
              prefixColor = prefixStatus ? 3 : 4;
              let buttons = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("welcome-toggle")
                    .setLabel("Welcoming")
                    .setStyle(welcomeColor),
                  new ButtonBuilder()
                    .setCustomId("bye-toggle")
                    .setLabel("Leaving")
                    .setStyle(byeColor),
                  new ButtonBuilder()
                    .setCustomId("logs-toggle")
                    .setLabel("Logs")
                    .setStyle(logsColor)
                ),
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("boost-toggle")
                    .setLabel("Boost Alerts")
                    .setStyle(boostColor),
                  new ButtonBuilder()
                    .setCustomId("botwl-toggle")
                    .setLabel("Bots Whitelist")
                    .setStyle(botWlColor),
                  new ButtonBuilder()
                    .setCustomId("prefix-toggle")
                    .setLabel("Prefix Whitelist")
                    .setStyle(prefixColor)
                ),
              ];
              interaction.deferUpdate();
              interaction.message.edit({
                embeds: [
                  embedTemp
                    .setTitle("Features Control Panel")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`
                                > Welcoming Status: ${
                                  welcomeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Leaving Status: ${
                                  byeStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Logs Status: ${
                                  logsStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                                
                                > Boosting Status: ${
                                  boostStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Bots Whitelist Status: ${
                                  botsWlStatus
                                    ? `**ON** ${onEmoji}`
                                    : `**OFF** ${offEmoji}`
                                }
                    
                                > Prefix Status: ${
                                  prefixStatus
                                    ? `**ON** ${onEmoji} \`${
                                        guildData.prefix || "!"
                                      }\``
                                    : `**OFF** ${offEmoji}`
                                }
                                            `),
                ],
                components: buttons,
              });
              await sendLogs(i.guild, "Feature", {
                description: `${i.user} turned ${
                  boostStatus ? "off" : "on"
                } the boost alerts`,
                color: "Purple",
                avatarURL: i.user.displayAvatarURL(),
                username: i.user.username,
              });
            }
          }
          break;
        case "botwl-toggle":
          {
            if (
              interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
              )
            ) {
              let guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });

              if (!guildData) {
                await guildDb.create({
                  guildId: interaction.guild.id,
                });
              }

              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });

              let welcomeStatus = guildData.welcomeStatus;
              let byeStatus = guildData.byeStatus;
              let logsStatus = guildData.logsStatus;
              let boostStatus = guildData.boostStatus;
              let botsWlStatus = guildData.botsWlStatus;
              let prefixStatus = guildData.prefixStatus;

              var embedTemp = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setThumbnail(client.user.displayAvatarURL());

              let welcomeColor = welcomeStatus ? 3 : 4;
              let byeColor = byeStatus ? 3 : 4;
              let logsColor = logsStatus ? 3 : 4;
              let boostColor = boostStatus ? 3 : 4;
              let botWlColor = !botsWlStatus ? 3 : 4;
              let prefixColor = prefixStatus ? 3 : 4;

              await guildData.updateOne({
                botsWlStatus: !botsWlStatus,
              });

              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });
              botsWlStatus = guildData.botsWlStatus;
              welcomeColor = welcomeStatus ? 3 : 4;
              byeColor = byeStatus ? 3 : 4;
              logsColor = logsStatus ? 3 : 4;
              boostColor = boostStatus ? 3 : 4;
              botWlColor = botsWlStatus ? 3 : 4;
              prefixColor = prefixStatus ? 3 : 4;
              let buttons = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("welcome-toggle")
                    .setLabel("Welcoming")
                    .setStyle(welcomeColor),
                  new ButtonBuilder()
                    .setCustomId("bye-toggle")
                    .setLabel("Leaving")
                    .setStyle(byeColor),
                  new ButtonBuilder()
                    .setCustomId("logs-toggle")
                    .setLabel("Logs")
                    .setStyle(logsColor)
                ),
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("boost-toggle")
                    .setLabel("Boost Alerts")
                    .setStyle(boostColor),
                  new ButtonBuilder()
                    .setCustomId("botwl-toggle")
                    .setLabel("Bots Whitelist")
                    .setStyle(botWlColor),
                  new ButtonBuilder()
                    .setCustomId("prefix-toggle")
                    .setLabel("Prefix Whitelist")
                    .setStyle(prefixColor)
                ),
              ];

              interaction.deferUpdate();

              interaction.message.edit({
                embeds: [
                  embedTemp
                    .setTitle("Features Control Panel")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`
                                        > Welcoming Status: ${
                                          welcomeStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Leaving Status: ${
                                          byeStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Logs Status: ${
                                          logsStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Boosting Status: ${
                                          boostStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Bots Whitelist Status: ${
                                          botsWlStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Prefix Status: ${
                                          prefixStatus
                                            ? `**ON** ${onEmoji} \`${
                                                guildData.prefix || "!"
                                              }\``
                                            : `**OFF** ${offEmoji}`
                                        }
                                    `),
                ],
                components: buttons,
              });
              await sendLogs(i.guild, "Feature", {
                description: `${i.user} turned ${
                  botsWlStatus ? "off" : "on"
                } the bots whitelist`,
                color: "Purple",
                avatarURL: i.user.displayAvatarURL(),
                username: i.user.username,
              });
            }
          }
          break;
        case "prefix-toggle":
          {
            if (
              interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
              )
            ) {
              let guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });

              if (!guildData) {
                await guildDb.create({
                  guildId: interaction.guild.id,
                });
              }

              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });

              let welcomeStatus = guildData.welcomeStatus;
              let byeStatus = guildData.byeStatus;
              let logsStatus = guildData.logsStatus;
              let boostStatus = guildData.boostStatus;
              let botsWlStatus = guildData.botsWlStatus;
              let prefixStatus = guildData.prefixStatus;

              var embedTemp = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setThumbnail(client.user.displayAvatarURL());

              let welcomeColor = welcomeStatus ? 3 : 4;
              let byeColor = byeStatus ? 3 : 4;
              let logsColor = logsStatus ? 3 : 4;
              let boostColor = boostStatus ? 3 : 4;
              let botWlColor = botsWlStatus ? 3 : 4;
              let prefixColor = !prefixStatus ? 3 : 4;

              if (!guildData.prefix) {
                return interaction.reply({
                  content:
                    "There are more settings you need to setup before being able to turn on this feature. Use `/setup prefix` to set them up.",
                  ephemeral: true,
                });
              }

              await guildData.updateOne({
                prefixStatus: !prefixStatus,
              });

              guildData = await guildDb.findOne({
                guildId: interaction.guild.id,
              });

              prefixStatus = guildData.prefixStatus;
              welcomeColor = welcomeStatus ? 3 : 4;
              byeColor = byeStatus ? 3 : 4;
              logsColor = logsStatus ? 3 : 4;
              boostColor = boostStatus ? 3 : 4;
              botWlColor = botsWlStatus ? 3 : 4;
              prefixColor = prefixStatus ? 3 : 4;
              let buttons = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("welcome-toggle")
                    .setLabel("Welcoming")
                    .setStyle(welcomeColor),
                  new ButtonBuilder()
                    .setCustomId("bye-toggle")
                    .setLabel("Leaving")
                    .setStyle(byeColor),
                  new ButtonBuilder()
                    .setCustomId("logs-toggle")
                    .setLabel("Logs")
                    .setStyle(logsColor)
                ),
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("boost-toggle")
                    .setLabel("Boost Alerts")
                    .setStyle(boostColor),
                  new ButtonBuilder()
                    .setCustomId("botwl-toggle")
                    .setLabel("Bots Whitelist")
                    .setStyle(botWlColor),
                  new ButtonBuilder()
                    .setCustomId("prefix-toggle")
                    .setLabel("Prefix Whitelist")
                    .setStyle(prefixColor)
                ),
              ];

              interaction.deferUpdate();

              interaction.message.edit({
                embeds: [
                  embedTemp
                    .setTitle("Features Control Panel")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`
                                        > Welcoming Status: ${
                                          welcomeStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Leaving Status: ${
                                          byeStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Logs Status: ${
                                          logsStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Boosting Status: ${
                                          boostStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Bots Whitelist Status: ${
                                          botsWlStatus
                                            ? `**ON** ${onEmoji}`
                                            : `**OFF** ${offEmoji}`
                                        }
                                        
                                        > Prefix Status: ${
                                          prefixStatus
                                            ? `**ON** ${onEmoji} \`${
                                                guildData.prefix || "!"
                                              }\``
                                            : `**OFF** ${offEmoji}`
                                        }
                                    `),
                ],
                components: buttons,
              });
              await sendLogs(i.guild, "Feature", {
                description: `${i.user} turned ${
                  prefixStatus ? "off" : "on"
                } the prefix whitelist feature.`,
                color: "Purple",
                avatarURL: i.user.displayAvatarURL(),
                username: i.user.username,
              });
            }
          }
          break;

        case "commandsReload":
          {
            if (interaction.user.id !== "370995733509177355")
              return interaction.deferUpdate();
            await client.collection.interactioncommands.clear();
            await client.collection.prefixcommands.clear();
            await client.collection.msgcommands.clear();
            loadCommands(client);
            interaction.reply({
              content: "reloaded commands successfully",
              ephemeral: true,
            });
          }
          break;
        case "eventsReload":
          {
            if (interaction.user.id !== "370995733509177355")
              return interaction.deferUpdate();
            // await client.collection.events.clear()
            loadEvents(client);
            interaction.reply({
              content: "reloaded events successfully",
              ephemeral: true,
            });
          }
          break;
      }
      async function checkRoles(roles) {
        console.log(roles);
        let dangerRoles = [];
        let unmanagedRoles = [];
        roles.forEach((role) => {
          const r = interaction.guild.roles.cache.get(role);
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
      /*
            
                new ButtonBuilder().setCustomId('boost-toggle').setLabel('Boost Alerts').setStyle(boostColor),
                new ButtonBuilder().setCustomId('botwl-toggle').setLabel('Bots Whitelist').setStyle(botWlColor),
                new ButtonBuilder().setCustomId('prefix-toggle').setLabel('Prefix Whitelist').setStyle(prefixColor),
            */
    } catch (err) {
      console.error(err);
    }
  },
};
