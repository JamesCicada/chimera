const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
  PermissionFlagsBits,
  WebhookClient,
  EmbedBuilder,
} = require("discord.js");
const config = require("../config");
const commands = require("../handlers/commands");
const events = require("../handlers/events");
const deploy = require("../handlers/deploy");
const mongoose = require("../handlers/mongoose");
const components = require("../handlers/components");
const { streamStart } = require("../otherEvents/twitch/streamStart");
const InvitesTracker = require("@androz2091/discord-invites-tracker");
const logsDb = require("../schemas/logs");
const memberDb = require("../schemas/member");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { YouTubePlugin } = require("@distube/youtube");
const { DeezerPlugin } = require("@distube/deezer");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const srDb = require("../schemas/stream");
const { run } = require("../otherEvents/twitch/streamStart");
const fs = require("fs");
require("dotenv").config();
module.exports = class extends Client {
  collection = {
    interactioncommands: new Collection(),
    prefixcommands: new Collection(),
    msgcommands: new Collection(),
    aliases: new Collection(),
    msgaliases: new Collection(),
    dmsCooldown: new Collection(),
    components: {
      buttons: new Collection(),
      selects: new Collection(),
      modals: new Collection(),
      autocomplete: new Collection(),
    },
  };
  applicationcommandsArray = [];

  distube = new DisTube(this, {
    plugins: [
      new YouTubePlugin({
        cookies: JSON.parse(fs.readFileSync("cookies.json", "utf-8")), // use this extension to get cookies and make sure to select JSON format https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc?hl=en-US
        ytdlOptions: {
          requestOptions: {
            headers: {
              "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
            },
          },
          playerClients: ["WEB"],
        },
      }),
      new SoundCloudPlugin(),
      new SpotifyPlugin({
        api: {
          clientId: process.env.SPOTIFY_ID,
          clientSecret: process.env.SPOTIFY_SECRET,
          topTracksCountry: "UK",
        },
      }),
      new DeezerPlugin(),
    ],
    emitAddListWhenCreatingQueue: true,
    emitAddSongWhenCreatingQueue: true,
      // // new YtDlpPlugin(),
      // // new SoundCloudPlugin(),
    // ],
  });
  constructor() {
    super({
      intents: [
        "Guilds",
        "DirectMessages",
        "GuildMembers",
        "GuildInvites",
        "GuildWebhooks",
        "GuildVoiceStates",
        "GuildBans",
        "GuildModeration",
      ],
      partials: [Object.keys(Partials)],
    });
  }

  start = async () => {
    try {
      mongoose();
      commands(this);
      events(this);
      components(this);
      run(this);

      this.warned = new Collection();
      this.audit = new Collection();
      const tracker = InvitesTracker.init(this, {
        fetchGuilds: true,
        fetchVanity: true,
        fetchAuditLogs: true,
      });

      tracker.on("guildMemberAdd", async (member, type, invite) => {
        try {
          if (
            !member.guild.members.me.permissions.has(
              PermissionFlagsBits.ManageGuild
            )
          )
            return;
          if (
            !member.guild.members.me.permissions.has(
              PermissionFlagsBits.Administrator
            )
          )
            return;
          const logData = await logsDb.findOne({
            guildId: member.guild.id,
          });
          if (!logData || !logData.logStatus.join || !logData.logChannels.join)
            return;

          const logsChannel = new WebhookClient({
            url: logData.logChannels.join,
          });
          let memberData;
          let inviterData;
          const embed = new EmbedBuilder()
            .setThumbnail(
              member.displayAvatarURL() ||
                member.guild.iconURL() ||
                this.user.displayAvatarURL()
            )
            .setColor("Green");
          if (invite?.inviter) {
            if (invite?.inviter && type === "normal") {
              inviterData = await memberDb.findOne({
                guildId: member.guild.id,
                memberId: invite.inviter.id,
              });
              if (!inviterData) {
                await memberDb.create({
                  guildId: member.guild.id,
                  memberId: invite.inviter.id,
                });
              }

              memberData = await memberDb.findOne({
                guildId: member.guild.id,
                memberId: member.id,
              });
              if (!memberData) {
                await memberDb.create({
                  guildId: member.guild.id,
                  memberId: member.id,
                });
              }
              memberData = await memberDb.findOne({
                guildId: member.guild.id,
                memberId: member.id,
              });
              await memberData.updateOne({
                $set: {
                  invitedBy: invite.inviter.id,
                },
              });
            }
            inviterData = await memberDb.findOne({
              guildId: member.guild.id,
              memberId: invite.inviter.id,
            });
            await inviterData.updateOne({
              $addToSet: {
                invites: member.id,
              },
            });
            await logsChannel
              .send({
                embeds: [
                  embed.setDescription(`
                ### New Member Joined

                > Member: ${member} (${member.id})

                > Used Link: [\`${invite.code}\`](${invite.url})
                ${
                  type === "normal"
                    ? `\n> Inviter: ${invite.inviter || "None"} (${
                        invite.inviter.id || "None"
                      })`
                    : ""
                }

                
                `),
                ],
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            await logsChannel
              .send({
                embeds: [
                  embed.setDescription(`
                ### New Member Joined

                > Member: ${member} (${member.id})

                Unknown Link. 
                `),
                ],
              })
              .catch((err) => {
                console.log(err);
              });
          }
        } catch (err) {
          console.log(err);
        }
      });
      this.distube
        .on("playSong", (queue, song) => {
          queue.textChannel.send({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `🎶 | Started Playing [${song.name}](${song.url})`
                )
                .setColor("Random"),
            ],
          });
        })
        .on("finish", (queue) => {
          queue.textChannel.send({
            embeds: [
              new EmbedBuilder()
                .setDescription(`⏹ | Finished playing Music!`)
                .setColor("Random"),
            ],
          });
        })
        .on("addSong", (queue, song) => {
          // queue.textChannel.send({
          //   embeds: [
          //     new EmbedBuilder()
          //       .setDescription(
          //         `🎶 | Added [${song.name}](${song.url}) to queue`
          //       )
          //       .setColor("Random"),
          //   ],
          // });
        })
        .on("addList", (queue, playlist) => {
          queue.textChannel.send({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `🎶 | Added ${playlist.songs.length} songs from [${playlist.name}](${playlist.url}) to queue`
                )
                .setColor("Random"),
            ],
          });
        });
      await this.login(process.env.CLIENT_TOKEN || config.client.token).catch(
        (err) => console.log(err)
      );

      if (config.handler.deploy) deploy(this, config);
    } catch (err) {
      console.log(err);
    }
  };
};
function parseNetscapeCookieFile(data) {
  const cookies = [];

  try {
    const lines = data.split("\n");

    for (const line of lines) {
      // Skip comments and empty lines
      if (!line.trim() || line.startsWith("#")) {
        continue;
      }

      // Split the line into fields (Netscape format has 7 fields)
      const fields = line.split("\t");
      if (fields.length < 7) {
        continue;
      }

      // Extract cookie fields
      const cookie = {
        domain: fields[0],
        include_subdomains: fields[1].toLowerCase() === "true",
        path: fields[2],
        secure: fields[3].toLowerCase() === "true",
        expires: parseInt(fields[4], 10) || 0,
        name: fields[5],
        value: fields[6],
      };

      // Convert expires timestamp to ISO format if not 0
      if (cookie.expires !== 0) {
        cookie.expires_iso = new Date(cookie.expires * 1000).toISOString();
      }

      cookies.push(cookie);
    }
    console.log(cookies);

    return cookies;
  } catch (error) {
    throw new Error(`Error reading cookie file: ${error.message}`);
  }
}
