const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const moment = require('moment')

module.exports = {
    structure: {
		name: "clear",
		description: "Manage audit logs!",
		aliases: ["cl", "bulkdelete", 'clean'],
		cooldown: 15000,
	},
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */
    run: async (client, message, args) => {
        try {
            const interaction = message;
            const number = Math.round(parseInt(args[0]));
            const mode = args[1]
            const mem = message.mentions.users.first();
            if(!number || number <= 0 || number > 1000) return interaction.reply({content: 'Please specify a number greater than 0 and less than 1000'});
            const maxMessagesPerBatch = 100;
            let totalDeleted = 0;

            const response = await interaction.reply({
                content: `<a:chimera_loading:1189609175840460961> Deleting ${number} messages...`,
            });
            while (totalDeleted < number) {
                let messages = (await interaction.channel.messages.fetch({ limit: maxMessagesPerBatch, before: response.id })).filter((ms) => ms.bulkDeletable);
                if (mode && mode == 'bot') {
                    messages = messages.filter((ms) => ms.author.bot)
                } else if(mode && mode == 'human') {
                    messages = messages.filter((ms) => !ms.author.bot)
                }
                if(mem){
                    messages = messages.filter((ms) => ms.author.id === mem.id)
                }
                if (messages.size === 0) {
                    break;
                }
                totalDeleted += messages.size
                console.log(totalDeleted);
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
                    }, 10 * 1000);
                }
            }

            if (totalDeleted < number) {
                await response.edit({
                    content: `Deleted ${totalDeleted} messages. (Requested: ${number})`,
                });
                setTimeout(() => {
                    response.delete();
                }, 10 * 1000); // Delete the response message after 10 seconds
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
