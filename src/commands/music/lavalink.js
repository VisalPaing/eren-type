const Command = require("../../struct/command.js");
const prettyMs = require("pretty-ms");

class LavalinkCommand extends Command {
  constructor() {
    super({
      id: "lavalink",
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message) {
    try {
      const nodes = [...this.client.erela.nodes.values()];
      const embed = this.client.BaseEmbed(message);
      embed.setAuthor("Source Code", false, "https://github.com/NekoYasui/discord-music");
      embed.setDescription(
        nodes.map(node  => {
          const cpuLoad = (node.stats.cpu.lavalinkLoad * 100).toFixed(2);
          const memUsage = (node.stats.memory.used / 1024 / 1024).toFixed(2);
          const uptime = prettyMs(node.stats.uptime, { verbose: true, secondsDecimalDigits: 0 });

          return `\`\`\`asciidoc
ID        :: ${node.id}
Status    :: ${node.connected ? "Connected" : "Disconnected"}
${node.connected ? `
CPU Load  :: ${cpuLoad}%
Mem Usage :: ${memUsage} MB
Uptime    :: ${uptime}
Players   :: ${node.stats.playingPlayers} of ${node.stats.players} playing` : ""}\`\`\``;
        })
      );
      return message.channel.send(embed);
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = LavalinkCommand;