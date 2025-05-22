const {
    EmbedBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");
/**
 * @param {ButtonBuilder} interaction
 * @param {Client} client
 */
module.exports = {
    event: "interactionCreate",
    cooldown: 50,
    run: async (client, interaction) => {
        try {
            if (!interaction.customId) return
            const { message, guild, member, channel, customId } = interaction
            if (customId.startsWith('support-ticket-')) {
                try {
                    let parent = channel.parent
                    parent.children.create({
                        name: `${interaction.component.label}-${member.id}`,
                        type: 0,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: ["ViewChannel",]
                            },
                            {
                                id: member.id,
                                allow: ["ViewChannel", "SendMessages"],
                            },
                        ],
                        reason: `Created Ticket Channel by ${member.displayName} (${member.id})`
                    }).then((ch) => {
                        ch.send({
                            embeds: [
                                new EmbedBuilder().setTitle(`${interaction.component.label} for ${member.displayName} (${member.id})`).setDescription(`Please wait for moderators to check your ticker, you can add someone to the ticket to discuss something.`)
                            ],
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder().setCustomId(`close-ticket-${channel.id}`).setLabel('Close Ticket').setStyle('Danger').setEmoji('🔒'),
                                    new ButtonBuilder().setCustomId(`add-member-${channel.id}`).setLabel('Add Member').setStyle('Primary').setEmoji('👥'),
                                )
                            ]
                        })
                        interaction.reply({
                            content: `${member} Here's your ticket ${ch}`,
                            ephemeral: true
                        })
                    })
                } catch (err) {
                    console.log(err);
                }

            } else if (customId.startsWith('close-ticket')) {
                let ownerId = channel.name.split('-')
                ownerId = ownerId[ownerId.length -1]
                console.log(ownerId);
                if (member.permissions.has(PermissionFlagsBits.Administrator)) {
                    channel.delete([`Deleted Ticket Channel by ${member.displayName} (${member.id})`])
                } else {
                    if (member.id !== ownerId) return interaction.deferUpdate()
                    channel.permissionOverwrites.edit(ownerId, {
                        ViewChannel: false,
                    });
                    channel.send({
                        embeds: [
                            new EmbedBuilder().setDescription(`${member} deleted his ticket but only mods decide when to delete the channel`)
                        ],
                    })
                }
            } else if (customId.startsWith('add-member')) {
                const modal = new ModalBuilder()
                    .setCustomId(`add-mem-${channel.id}`)
                    .setTitle("Add Member To Ticket");

                // Add components to modal

                // Create the text input components
                const memberId = new TextInputBuilder()
                    .setCustomId("member-id")
                    .setLabel("The id of the member you wanna add")
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(15);
                const reason = new TextInputBuilder()
                    .setCustomId("member-reason")
                    .setLabel("The reason for adding them")
                    .setStyle(TextInputStyle.Short)

                // An action row only holds one text input,
                // so you need one action row per text input.
                const firstActionRow = new ActionRowBuilder().addComponents(memberId);
                const secondActionRow = new ActionRowBuilder().addComponents(reason);

                // Add inputs to the modal
                modal.addComponents(
                    firstActionRow,
                    secondActionRow
                );
                await interaction.showModal(modal);
            } else if (customId.startsWith('add-mem')) {
                const memId = interaction.fields.getTextInputValue("member-id");
                const reason = interaction.fields.getTextInputValue("member-reason");
                let mem = guild.members.cache.get(memId) || await guild.members.fetch(memId)
                if(!mem) return interaction.reply({
                    content: `Please give a valid user ID!`,
                    ephemeral: true
                })
                if(mem.id == member.id) return interaction.reply({
                    content: `You can't add yourself! silly 😅`,
                    ephemeral: true
                })
                let ownerId = channel.name.split('-')[1]
                ownerId = ownerId[ownerId.length -1]
                console.log(ownerId);
                if (member.permissions.has(PermissionFlagsBits.Administrator)) {
                    channel.permissionOverwrites.edit(memId, {
                        ViewChannel: true,
                        SendMessages: true
                    });
                    interaction.reply({
                        content: "Added ✅",
                        ephemeral: true,
                      });
                    channel.send({
                        embeds: [
                            new EmbedBuilder().setDescription(`${mem} was added to this ticket\n${reason != ''? `Reason: ${reason}`:{}}`)
                        ],
                    })
                } else {
                    if (member.id !== ownerId) return interaction.deferUpdate()
                    channel.permissionOverwrites.edit(memId, {
                        ViewChannel: true,
                        SendMessages: true
                    });
                    interaction.reply({
                        content: "Added ✅",
                        ephemeral: true,
                      });
                    channel.send({
                        embeds: [
                            new EmbedBuilder().setDescription(`${mem} was added to this ticket\n${reason != ''? `Reason: ${reason}`:{}}`)
                        ],
                    })
                }
            }
        } catch (err) {
            console.error(err);
        }
    },
};
