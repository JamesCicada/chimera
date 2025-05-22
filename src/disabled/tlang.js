const {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  Presence,
} = require("discord.js");
const usersDb = require('../../../schemas/user')
module.exports = {
  structure: new SlashCommandBuilder()
    .setName("tlang")
    .setDescription("Change The Prefered Language.").addStringOption((option) => option.setName('language').setDescription('The Language You Choose').addChoices(
      {
        name: 'English',
        value: 'en'
      },
      {
        name: 'Arabic',
        value: 'ar'
      },
      {
        name: 'French',
        value: 'fr'
      },
      {
        name: 'Spanish',
        value: 'es'
      },
      {
        name: 'German',
        value: 'de'
      },
      {
        name: 'Italian',
        value: 'it'
      },
      {
        name: 'Portuguese',
        value: 'pt'
      },
      {
        name: 'Russian',
        value: 'ru'
      },
      {
        name: 'Chinese',
        value: 'zh'
      },
      {
        name: 'Japanese',
        value: 'ja'
      },
      {
        name: 'Korean',
        value: 'ko'
      },
      {
        name: 'Hindi',
        value: 'hi'
      },
      {
        name: 'Bengali',
        value: 'bn'
      },
      {
        name: 'Indonesian',
        value: 'id'
      },
      {
        name: 'Turkish',
        value: 'tr'
      },
      {
        name: 'Dutch',
        value: 'nl'
      },
      {
        name: 'Swedish',
        value: 'sv'
      },
      {
        name: 'Polish',
        value: 'pl'
      },
      {
        name: 'Greek',
        value: 'el'
      },
      {
        name: 'Czech',
        value: 'cs'
      }
    )),
  /**
   * 
   * @param {ChatInputCommandInteraction} interaction 
   * @param {Client} client 
   */
  run: async (client, interaction) => {
    try {
      let langs = [
        {
          name: 'English',
          value: 'en'
        },
        {
          name: 'Spanish',
          value: 'es'
        },
        {
          name: 'French',
          value: 'fr'
        },
        {
          name: 'German',
          value: 'de'
        },
        {
          name: 'Italian',
          value: 'it'
        },
        {
          name: 'Portuguese',
          value: 'pt'
        },
        {
          name: 'Russian',
          value: 'ru'
        },
        {
          name: 'Chinese',
          value: 'zh'
        },
        {
          name: 'Japanese',
          value: 'ja'
        },
        {
          name: 'Korean',
          value: 'ko'
        },
        {
          name: 'Arabic',
          value: 'ar'
        },
        {
          name: 'Hindi',
          value: 'hi'
        },
        {
          name: 'Bengali',
          value: 'bn'
        },
        {
          name: 'Indonesian',
          value: 'id'
        },
        {
          name: 'Turkish',
          value: 'tr'
        },
        {
          name: 'Dutch',
          value: 'nl'
        },
        {
          name: 'Swedish',
          value: 'sv'
        },
        {
          name: 'Polish',
          value: 'pl'
        },
        {
          name: 'Greek',
          value: 'el'
        },
        {
          name: 'Czech',
          value: 'cs'
        }
      ]
      
      let user = interaction.user
      let lang = interaction.options.getString('language')
      let userDb = await usersDb.findOne({
        userId: user.id
      })
      function getNameByValue(value) {
        for (let i = 0; i < langs.length; i++) {
          if (langs[i].value === value) {
            return langs[i].name;
          }
        }
        return null;
      }
      if (!lang) {
        if (!userDb || !userDb.language) {
          await interaction.reply({
            content: 'No Language was Set!',
            ephemeral: true
          })
        } else {
          let currentLang = userDb.language
          await interaction.reply({
            content: `Your Current Language is **${getNameByValue(currentLang)}**!`,
            ephemeral: true
          })
        }
      } else {
        if (!userDb) {
          await usersDb.create({
            userId: user.id,
            language: lang
          })
        } else {
          await userDb.updateOne({
            language: lang
          })
        }
        userDb = await usersDb.findOne({
          userId: user.id
        })
        await interaction.reply({
          content: `From now on I will translate text to **${getNameByValue(lang)}** for you!`,
          ephemeral: true
        })
      }

    } catch (err) {
      console.log(err);
    }

  },
};
