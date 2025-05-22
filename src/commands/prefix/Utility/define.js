const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Client,
    EmbedBuilder,
} = require("discord.js");
const axios = require('axios')
module.exports = {
	structure: {
		name: "define",
		description: "Definition of a word from dictionary!",
		aliases: ["explain", "definition", 'dictionary', 'dict'],
		cooldown: 5000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {Message} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
        const interaction = message;
        let providedWord = args[0]
        async function define(word) {
            try {
                const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

                if (response.data.length === 0 || response.data.length === 'No Definitions Found') {
                    return null;
                }

                return response.data[0];
            } catch (error) {
                console.log(error);
                return null;
            }
        }

        try {
            let definition = await define(providedWord)
            if (!definition) {
                return interaction.reply({
                    content: `Sorry pal, we couldn't find definitions for the word you were looking for.`,
                    ephemeral: true,
                });
            }
            let meaningsArray = [];
            for (const meaning of definition.meanings) {
                const definitionsArray = meaning.definitions
                    .map((definition) => definition.definition)//.slice(0, 5);
                const synonymsArray = meaning.definitions
                    .slice(0, 5)
                    .flatMap((definition) => definition.synonyms);
                meaningsArray.push({
                    partOfSpeech: meaning.partOfSpeech,
                    definitions: definitionsArray,
                    synonyms: synonymsArray,
                });
            }
            let phoneticsArray = definition.phonetics
                .filter((phonetic) => phonetic.text !== undefined)
                .map((phonetic) => {
                    if (phonetic.audio) {
                        return `[${phonetic.text}](${phonetic.audio})`;
                    } else {
                        return phonetic.text;
                    }
                });
                console.log(definition.phonetics);
            let embed = new EmbedBuilder().setTitle(`Definition Of ${capitalizeFirstLetter(providedWord)} From English Dictionary with Phonetics`).setColor('Blurple').setDescription(`
                     > **Meanings:**\n${meaningsArray
                    .map((meaning) => `# **${meaning.partOfSpeech}:**\n> Definitions:\n    * ${meaning.definitions.join('\n    * ')}${meaning.synonyms.length > 0 ? `\n  * Synonyms:\n    * ${meaning.synonyms.join('\n    * ')}` : ''}`)
                    .join('\n\n')}\n\n${phoneticsArray.length > 0 ? `> **Phonetics:**\n${phoneticsArray.map((phonetic) => `* ${phonetic}`).join('\n')}\n` : ''}
                    `)
                .setFooter({
                    text: 'Please note that the audio links provided are sourced from the API.',
                    iconURL: `https://media.discordapp.net/attachments/1083081647202762792/1112488966768304149/warning-message-concept-represented-by-exclamation-mark-icon-exclamation-symbol-in-circle-png.png?width=701&height=701`
                })
            if (definition.sourceUrls.length > 0) {
                embed.setURL(definition.sourceUrls[0])
            }
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
        }
    },
};
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}