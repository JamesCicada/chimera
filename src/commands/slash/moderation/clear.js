const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const moment = require('moment')

module.exports = {
    category: 'moderation',
    usage: "clear [number] [humans/bot?]",
    mod: true,
    structure: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear messages based on the number provided")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption((option) => option
            .setName('number')
            .setDescription('The number of messages to delete')
            .setRequired(true)
        ).addUserOption((option) => option
            .setName('member')
            .setDescription('Filter deleted messages by Member'))
        .addStringOption((option) => option
            .setName('mode')
            .setDescription('Filter by Bots only or Humans only')
            .setChoices({
                name: 'Bot',
                value: 'bot'
            },
                {
                    name: 'Humans',
                    value: 'humans'
                })
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    run: async (client, interaction) => {
        try {
            const number = interaction.options.getInteger('number');
            const mem = interaction.options.getMember('member');
            const mode = interaction.options.getString('mode');
            const maxMessagesPerBatch = 100;
            let totalDeleted = 0;

            const response = await interaction.reply({
                content: `<a:chimera_loading:1189609175840460961> Deleting ${number} messages...`,
            });
            while (totalDeleted < number) {
                const toDelete = Math.min(maxMessagesPerBatch, number - totalDeleted);
                let messages = (await interaction.channel.messages.fetch({ limit: toDelete, before: response.id })).filter((ms) => ms.bulkDeletable);
                if (mode && mode == 'bot') {
                    messages = messages.filter((ms) => ms.author.bot)
                } else if(mode && mode == 'human') {
                    messages = messages.filter((ms) => !ms.author.bot)
                }
                if(mem){
                    messages = messages.filter((ms) => ms.author.id === mem.id)
                }
                console.log(messages.size);
                if (messages.size === 0) {
                    break;
                }
                totalDeleted = messages.size
                await interaction.channel.bulkDelete(messages)
                    .catch((err) => {
                        console.error(err);
                    });

                if (totalDeleted >= number) {
                    await response.edit({
                        content: `Deleted ${totalDeleted} messages.`,
                    });
                    setTimeout(() => {
                        response.delete();
                    }, 10000); // Delete the response message after 10 seconds
                }
            }

            if (totalDeleted < number) {
                await response.edit({
                    content: `Deleted ${totalDeleted} messages. (Requested: ${number})`,
                });
                setTimeout(() => {
                    response.delete();
                }, 10000); // Delete the response message after 10 seconds
            }
        } catch (err) {
            console.error(err);

            interaction.reply({
                content: `An error occurred. Please check my permissions.`,
                ephemeral: true,
            });
        }
    },
};
