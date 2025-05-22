const {
	Message,
	EmbedBuilder,
	ChatInputCommandInteraction,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const mongoose = require("mongoose");

module.exports = {
	structure: {
		name: "ping",
		description: "Replies with Pong!",
		aliases: ["p"],
		cooldown: 5000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {Message} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
		const botPing = client.ws.ping;
        message.reply("<a:chimera_loading:1189609175840460961> Pinging...").then(async (msg) => {
            const mongoPing = await estimateLatency();
                    const apiPing = await checkRestApiLatency(message.guild.shardId);
                    const embed = new EmbedBuilder().setDescription(`
                    > <:chimera_pingconnection:1189613705080623174> **Bot Ping:** ${botPing} ms

                    > <:chimera_slashcommand:1189612877875777546> **DB ping:** ${mongoPing} ms

                    > <:chimera_insights:1189612868933517423> **API Ping:** ${apiPing} ms
                    `);
                    await msg.edit({
                        content: '',
                        embeds: [embed],
                    });
        });
		
		async function estimateLatency() {
			const start = Date.now();
			await mongoose.connection.db.command({ ping: 1 });
			const end = Date.now();
			const estimatedLatency = end - start; // Milliseconds
			console.log("Estimated MongoDB latency:", estimatedLatency, "ms");
            return estimatedLatency
		}
		async function checkRestApiLatency(shardId) {
			const start = Date.now();
			await message.guild.fetchPreview();
			const end = Date.now();
			const latency = end - start;
			console.log(`Shard ${shardId} REST API Latency: ${latency}ms`);
            return latency
		}
	},
};
