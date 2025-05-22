const {
  ActivityType,
  Client,
  EmbedBuilder,
  GuildMember,
  WebhookClient,
  VoiceState,
} = require("discord.js");
const { getResMem } = require("../../Functions/getResponsible");
const logsDb = require("../../schemas/logs");
module.exports = {
  event: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   * @param {Client} client
   */
  run: async (client, oldState, newState) => {
    try {
      const member = newState.member;
      const guildDb = await logsDb.findOne({
        guildId: oldState.guild.id,
      });
      if (!guildDb || !guildDb.logStatus.voice || !guildDb.logChannels.voice)
        return;
      // Here The Code if The guild has voice logs Enabled
      const whook = new WebhookClient({
        url: guildDb.logChannels.voice,
      });
      const embed = new EmbedBuilder().setThumbnail(
        newState.member?.displayAvatarURL() ||
          newState.guild.iconURL() ||
          client.user.displayAvatarURL()
      );
      if (!whook) return;

      if (!oldState.channel && newState.channel) {
        whook
          .send({
            embeds: [
              embed.setColor("Green").setDescription(`
                        ### Join Voice Channel

                        > Member: ${newState.member} (${newState.member.id})

                        > Channel: ${newState.channel} (${newState.channel.id})
                        `),
            ],
          })
          .catch((err) => {
            console.log(err);
          });
      }

      if (oldState.channel && !newState.channel) {
        const timestamp = Date.now();
        const responsibleMember = await getResMem(
          client,
          member.guild,
          "MemberDisconnect",
          newState.channel,
          timestamp.valueOf()
        );
        if (responsibleMember) {
          whook.send({
            embeds: [
              embed.setColor("Red").setDescription(`
                            ### Disconnected From Voice Channel
    
                            > Member: ${oldState.member} (${oldState.member.id})
    
                            > Channel: ${oldState.channel} (${oldState.channel?.id}) (${oldState.channel?.name})

                            > Moderator: ${responsibleMember} (${responsibleMember.id})
                            `),
            ],
          });
        } else {
          whook
            .send({
              embeds: [
                embed.setColor("Red").setDescription(`
                            ### Left Voice Channel
    
                            > Member: ${oldState.member} (${oldState.member.id})
    
                            > Channel: ${oldState.channel} (${oldState.channel?.id}) (${oldState.channel?.name})
                            `),
              ],
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }

      if (
        oldState.channel &&
        newState.channel &&
        oldState.channel !== newState.channel
      ) {
        const timestamp = Date.now();
        const responsibleMember = await getResMem(
          client,
          member.guild,
          "MemberMove",
          newState.channel,
          timestamp.valueOf()
        );
        if (responsibleMember) {
          whook
            .send({
              embeds: [
                embed.setColor("Yellow").setDescription(`
                            ### Moved From Voice Channel
    
                            > Member: ${newState.member} (${newState.member.id})
    
                            > Old Channel: ${oldState.channel} (${newState.channel?.id}) (${oldState.channel?.name})

                            > New Channel: ${newState.channel} (${newState.channel?.id}) (${newState.channel?.name})

                            > Moderator: ${responsibleMember} (${responsibleMember.id})
                            `),
              ],
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          whook
            .send({
              embeds: [
                embed.setColor("Yellow").setDescription(`
                            ### Changed Voice Channel
    
                            > Member: ${newState.member} (${newState.member.id})
    
                            > Old Channel: ${oldState.channel} (${newState.channel?.id}) (${oldState.channel?.name})

                            > New Channel: ${newState.channel} (${newState.channel?.id}) (${newState.channel?.name})
                            `),
              ],
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
      if (oldState.serverMute !== newState.serverMute) {
        const timestamp = Date.now();
        const responsibleMember = await getResMem(
          client,
          newState.guild || oldState.guild,
          "MemberUpdate",   
          oldState.channel || newState.channel,
          timestamp.valueOf()
        );
        const action = newState.serverMute ? "Server Muted" : "Server Unmuted";
        if (!responsibleMember) return;
        whook
          .send({
            embeds: [
              embed.setColor("Orange").setDescription(`
                            ### ${action}
        
                            > Member: ${newState.member} (${newState.member.id})

                            > Moderator: ${responsibleMember}
                            `),
            ],
          })
          .catch((err) => {
            console.log(err);
          });
      }

      if (oldState.serverDeaf !== newState.serverDeaf) {
        const timestamp = Date.now();
        const action = newState.serverDeaf
          ? "Server Deafened"
          : "Server Undeafened";
        const responsibleMember = await getResMem(
          client,
          newState.guild || oldState.guild,
          "MemberUpdate",
          oldState.channel || newState.channel,
          timestamp.valueOf()
        );
        if (!responsibleMember) return;
        whook
          .send({
            embeds: [
              embed.setColor("Purple").setDescription(`
                            ### ${action}
        
                            > Member: ${newState.member} (${newState.member.id})

                            > Moderator: ${responsibleMember}
                            `),
            ],
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
