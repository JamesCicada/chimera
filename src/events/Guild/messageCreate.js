const { ChannelType, Message } = require("discord.js");
const config = require("../../config");
const { log } = require("../../functions");
const GuildSchema = require("../../schemas/guild");
const ExtendedClient = require("../../class/ExtendedClient");
const gDb = require("../../schemas/guild");
const cooldown = new Map();

module.exports = {
    event: "messageCreate",
    /**
     *
     * @param {ExtendedClient} client
     * @param {Message<true>} message
     * @returns
     */
    run: async (client, message) => {
        if (message.author.bot || message.channel.type === ChannelType.DM) return;

        if (!config.handler.commands.prefix) return;

        let prefix = config.handler.prefix;

        let gData = await GuildSchema.findOne({
            guildId: message.guildId,
        });

        if (gData && gData?.prefixStatus && gData?.prefix) prefix = gData.prefix;
        if(gData && gData?.prefixStatus === false) return;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandInput = args.shift().toLowerCase();

        if (!commandInput.length) return;

        let command =
            client.collection.prefixcommands.get(commandInput) ||
            client.collection.prefixcommands.get(
                client.collection.aliases.get(commandInput)
            );
        if(gData.disabledCommands?.includes(commandInput)) return;
        if(gData.disabledChannels?.includes(message.channelId)) return;
        if (command) {
            try {
                if (
                    command.structure?.permissions &&
                    !message.member.permissions.has(command.structure?.permissions)
                ) {
                    await message.reply({
                        content:
                            config.messageSettings.notHasPermissionMessage !== undefined &&
                                config.messageSettings.notHasPermissionMessage !== null &&
                                config.messageSettings.notHasPermissionMessage !== ""
                                ? config.messageSettings.notHasPermissionMessage
                                : `You don't have the required permissions to use this command! ${command.structure?.permissions}`,
                    });

                    return;
                }

                if (command.structure?.developers) {
                    if (!config.users.developers.includes(message.author.id)) {
                        setTimeout(async () => {
                            await message.reply({
                                content:
                                    config.messageSettings.developerMessage !== undefined &&
                                        config.messageSettings.developerMessage !== null &&
                                        config.messageSettings.developerMessage !== ""
                                        ? config.messageSettings.developerMessage
                                        : "You are not authorized to use this command",
                            });
                        }, 5 * 1000);
                    }

                    return;
                }

                if (command.structure?.nsfw && !message.channel.nsfw) {
                    await message.reply({
                        content:
                            config.messageSettings.nsfwMessage !== undefined &&
                                config.messageSettings.nsfwMessage !== null &&
                                config.messageSettings.nsfwMessage !== ""
                                ? config.messageSettings.nsfwMessage
                                : "The current channel is not a NSFW channel.",
                    });

                    return;
                }

                if (command.structure?.cooldown) {
                    const cooldownFunction = () => {
                        let data = cooldown.get(message.author.id);

                        data.push(commandInput);

                        cooldown.set(message.author.id, data);

                        setTimeout(() => {
                            let data = cooldown.get(message.author.id);

                            data = data.filter((v) => v !== commandInput);

                            if (data.length <= 0) {
                                cooldown.delete(message.author.id);
                            } else {
                                cooldown.set(message.author.id, data);
                            }
                        }, command.structure?.cooldown);
                    };

                    if (cooldown.has(message.author.id)) {
                        let data = cooldown.get(message.author.id);

                        if (data.some((v) => v === commandInput)) {
                            await message.reply({
                                content:
                                    config.messageSettings.cooldownMessage !== undefined &&
                                        config.messageSettings.cooldownMessage !== null &&
                                        config.messageSettings.cooldownMessage !== ""
                                        ? config.messageSettings.cooldownMessage
                                        : "Slow down buddy! You're too fast to use this command.",
                            });

                            return;
                        } else {
                            cooldownFunction();
                        }
                    } else {
                        cooldown.set(message.author.id, [commandInput]);

                        cooldownFunction();
                    }
                }

                command.run(client, message, args);
            } catch (error) {
                log(error, "err");
            }
        }
    },
};
