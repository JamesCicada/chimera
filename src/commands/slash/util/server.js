const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
module.exports = {
    category: 'utility',
    usage: "server",
    structure: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Information About this server"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            let guild = interaction.guild;
            let boostEmoji = '<:chimera_booster:1189612872578383952> ';
            let nitroEmoji = '<:chimera_nitro:1189612876147732581> ';
            let botEmoji = '<:chimera_discordbot:1189614969709404253>';
            let arrowEmoji = '<:chimera_arrowwhite:1189611797880250420>';
            let blackVerify = '<:chimera_verified:1189612874012827769>';
            let verifyEmoji = '<:chimera_verified:1189612874012827769>';
            let loadingEmoji = '<a:chimera_loading:1189609175840460961>';
            let textEmoji = '#️⃣';
            let voiceEmoji = '🔊';
            let textChannels = guild.channels.cache.filter((channel) =>
                channel.isTextBased()
            ).size;
            let voiceChannels = guild.channels.cache.filter((channel) =>
                channel.isVoiceBased()
            ).size;
            //console.log(bots);
            //let members = guild.memberCount - bots;
            let serverBackground = guild.iconURL({
                size: 1024,
                extension: "png",
                dynamic: true,
            });
            let embed = {
                title: `About ${guild.name}`,
                thumbnail: { url: serverBackground },
                color: 0xc27ba0,
                fields: [
                    {
                        name: `${arrowEmoji} Created At 🖊`,
                        value: `<t:${parseInt(
                            guild.createdTimestamp / 1000
                        )}:R>`,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Owner 👑`,
                        value: `<@${guild.ownerId}>`,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Description 📜`,
                        value:
                            "`" +
                            `${guild.description ? guild.description : "None"
                            }` +
                            "`",
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Members 🚹`,
                        value: `${guild.memberCount} ${verifyEmoji}`,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Text Channels ${textEmoji}`,
                        value: textChannels,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Voice Channels ${voiceEmoji}`,
                        value: voiceChannels,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Roles 🎭`,
                        value: guild.roles.cache.size,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji}  Emojis ${blackVerify}`,
                        value: guild.emojis.cache.size,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Boosts ${boostEmoji}`,
                        value: guild.premiumSubscriptionCount,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Nitro Level ${nitroEmoji}`,
                        value: guild.premiumTier,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Verification Level ${verifyEmoji}`,
                        value: guild.verificationLevel,
                        inline: true,
                    },
                    {
                        name: `${arrowEmoji} Features ${loadingEmoji}`,
                        value:
                            guild.features.length > 0
                                ? guild.features
                                    .map((feature) => `\`${feature}\``)
                                    .join(", ")
                                : "None",
                        inline: false,
                    },
                    {
                        name: "Rules Channel 📜",
                        value: guild.rulesChannel
                            ? guild.rulesChannel.toString()
                            : "None",
                        inline: true,
                    },
                    {
                        name: "System Channel 📜",
                        value: guild.systemChannel
                            ? guild.systemChannel.toString()
                            : "None",
                        inline: true,
                    },
                    {
                        name: "AFK Channel 🔊",
                        value: guild.afkChannel
                            ? guild.afkChannel.toString()
                            : "None",
                        inline: true,
                    },
                    {
                        name: "AFK Timeout 🔊",
                        value: guild.afkTimeout / 60 + " minutes",
                        inline: true,
                    },
                ],
                footer: {
                    text: `Server ID: ${guild.id}`,
                },
            };
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(error);
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
        }
    },
};
