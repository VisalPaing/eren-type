const Command = require("../struct/command.js");
const { MessageEmbed } = require("discord.js");

class PingCommand extends Command {
  constructor() {
    super({
      id: "ping",
      aliases: ["p"],
      ratelimit: 5,
    });
  }

  do(message) {
    const before = Date.now();
    try {
      return message.channel.send("*🏓 Pinging...*").then((msg) => {
        const latency = Date.now() - before;
        const wsLatency = this.client.ws.ping.toFixed(0);
        const embed = this.client.BaseEmbed(message);
        embed.setColor(this.client.color("random"));
        embed.setAuthor("🏓 PONG!");
        embed.setColor(this.searchHex(wsLatency));
        embed.setTimestamp();
        embed.addFields({
          name: "API Latency",
          value: `**\`${latency}\`** ms`,
          inline: true
        },{
          name: "WebSocket Latency",
          value: `**\`${wsLatency}\`** ms`,
          inline: true
        });
        msg.edit(embed);
        msg.edit("");
      });
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }

  searchHex(ms) {
    const listColorHex = [
      [0, 20, "#51e066"],
      [21, 50, "##51c562"],
      [51, 100, "#edd572"],
      [101, 150, "#e3a54a"],
      [150, 200, "#d09d52"]
    ];
    const defaultColor = "#e05151";
    const min = listColorHex.map(e => e[0]);
    const max = listColorHex.map(e => e[1]);
    const hex = listColorHex.map(e => e[2]);
    let ret = "#36393f";
    for (let i = 0; i < listColorHex.length; i++) {
      if (min[i] <= ms && ms <= max[i]) {
        ret = hex[i];
        break;
      } else {
        ret = defaultColor;
      }
    }
    return ret;
  }
}

module.exports = PingCommand;