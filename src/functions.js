const { WebhookClient, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
// import chalk from "chalk";

let logsArr = [];
const hook = new WebhookClient({ url: process.env.LOGS_WEBHOOK_URL });
let i = 0
/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
const log = (string, style) => {
	const styles = {
		info: { prefix: chalk.blue("[INFO]"), logFunction: console.log },
		err: { prefix: chalk.red("[ERROR]"), logFunction: console.error },
		warn: { prefix: chalk.yellow("[WARNING]"), logFunction: console.warn },
		done: { prefix: chalk.green("[SUCCESS]"), logFunction: console.log },
	};
	const selectedStyle = styles[style] || { logFunction: console.log };
	selectedStyle.logFunction(`${selectedStyle.prefix || ""} ${string}`);
  logsArr.push(`${selectedStyle.prefix || ""} ${string}`);
  if (i++ % 10 === 0 && i > 1 && style !== "err") {
    sendLogs(false);
    logsArr = [];
  } else if (style === "err") {
    sendLogs(true);
    logsArr.pop();
  }
};
async function sendLogs(isErr) {
	hook.send({
    content: `${isErr ? "<@370995733509177355>" : ""}`,
		username: `Chimera logs`,
		avatarURL:
			"https://images-ext-2.discordapp.net/external/jWiGllbYMl_zTQgag1rDVJ10UnW2N3gZzbRH3UNeRW0/https/cdn.discordapp.com/avatars/1189594649954877620/d0c797dd20ccb82a1f2d610bded2baed.webp?format=webp",
		embeds: [
			new EmbedBuilder()
				.setTitle(`Chimera logs ${(i - 1 )/ 10} ${isErr ? "ERROR" : ""}`)
				.setDescription(logsArr.join("\n"))
				.setColor(isErr ? "Red" : "DarkButNotBlack"),
		],
	});
}

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (time, style) => {
	return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ""}>`;
};

/**
 * Whenever a string is a valid snowflake (for Discord).

 * @param {string} id 
 * @returns {boolean}
 */
const isSnowflake = (id) => {
	return /^\d+$/.test(id);
};

module.exports = {
	log,
	time,
	isSnowflake,
};