const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    Client,
} = require("discord.js");
const memberDb = require('../../../schemas/member')
const randomColor = require("randomcolor");
module.exports = {
    category: 'utility',
    usage: "user [user]",
    structure: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Information About a member")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The member to get info of")
                .setRequired(false)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        let targetUser =
            interaction.options.getUser("user") || interaction.user;
        let targetMember =
            interaction.options.getMember("user") || interaction.member;
        let userForce = await client.users.fetch(targetMember, {
            force: true,
        });
        let memberData = await memberDb.findOne({
            guildId: interaction.guild.id,
            memberId: targetMember.id
        })
        if (!memberData) {
            await memberDb.create({
                guildId: interaction.guild.id,
                memberId: targetMember.id
            })
        }
        memberData = await memberDb.findOne({
            guildId: interaction.guild.id,
            memberId: targetMember.id
        })
        let boostEmoji = '<:chimera_booster:1189612872578383952> ';
        let nitroEmoji = '<:chimera_nitro:1189612876147732581> ';
        let botEmoji = '<:chimera_discordbot:1189614969709404253>';
        let arrowEmoji = '<:chimera_arrowwhite:1189611797880250420>';
        if (!targetMember) return interaction.reply({ content: `user isn't a member in this server`, ephemeral: true });
        let banner = userForce.bannerURL({ size: 1024, dynamic: true });
        let bannerURL = banner ? "`run /banner command to get banner url`" : "No Banner"
        let isBot = targetUser.bot ? 'Yes' : 'No'
        if (targetMember.premiumSince) {
            var color = 0xf47fff;
            var boost = `<t:${parseInt(
                targetMember.premiumSinceTimestamp / 1000
            )}:R> ${boostEmoji}`;
        } else {
            var color = parseInt(randomColor().replace("#", "0x"), 16);
            var boost = "`No Boost`";
        }
        let embed = {
            title: `${targetUser.tag}`,
            thumbnail: { url: targetMember.displayAvatarURL({ size: 1024, dynamic: true }) || client.user.displayAvatarURL() },
            color: color,

            // image: {
            //     url: targetUser.displayAvatarURL({ size: 1024, dynamic: true }),
            // },
            fields: [
                {
                    name: `${arrowEmoji} Created At 🖊`,
                    value: `<t:${parseInt(
                        targetUser.createdTimestamp / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: `${arrowEmoji} Joined At 📥`,
                    value: `<t:${parseInt(
                        targetMember.joinedTimestamp / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: `${arrowEmoji} Bot? ${botEmoji}`,
                    value: isBot,
                    inline: true,
                },
                {
                    name: `${arrowEmoji} Roles 🎭`,
                    value: targetMember.roles.cache

                        .map((role) => role.toString())
                        .join(" ").replace('@everyone', ''),
                },
                {
                    name: `${arrowEmoji} Boosting Since ${nitroEmoji}`,
                    value: boost,
                },
                {
                    name: `Banner`,
                    value: bannerURL,
                },
                {
                    name: `invites`,
                    value: memberData.invites.length,
                },
                {
                    name: `invited By`,
                    value: `${memberData.invitedBy ? `<@${memberData.invitedBy}>` : 'None'}`,
                },
            ],
            footer: {
                text: `ID: ${targetUser.id}`,
                image: { url: targetUser.displayAvatarURL() },
            },
        };
        try {
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
