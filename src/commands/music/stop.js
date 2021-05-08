const Command = require("../../struct/command.js");

class StopCommand extends Command {
  constructor() {
    super({
      id: "stop",
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message) {
    try {
      const player = this.client.erela.get(message.guild.id);
      if (!player) return message.channel.send(this.client.BaseEmbed(message).setDescription("There is no player for this guild."));

      const { channel } = message.member.voice;

      if (!channel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You need to join a voice channel."));
      if (channel.id !== player.voiceChannel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You're not in the same voice channel."));

      // Destory player (clears queue & leaves channel)
		  player.destroy();
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`⏹` Stopped the player."));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = StopCommand;