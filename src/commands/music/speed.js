const Command = require("../../struct/command.js");

class SpeedCommand extends Command {
  constructor() {
    super({
      id: "speed",
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message, [speed = 1]) {
    try {
      const player = this.client.erela.get(message.guild.id);
      if (!player) return message.channel.send(this.client.BaseEmbed(message).setDescription("There is no player for this guild."));

      const { channel } = message.member.voice;

      if (!channel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You need to join a voice channel."));
      if (channel.id !== player.voiceChannel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You're not in the same voice channel."));
      if (!player.queue.current)  return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` There is no music playing."));
      if (!player.queue.current.isSeekable) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You can't speedup a live video."));

      const speedTo = speed ? parseInt(speed, 10) : null;
      if (speedTo !== null && (isNaN(speedTo) || speedTo < 1 || speedTo > 10)) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`🚫\` You need to give me a number between 1 and 10.`));
      if (speedTo > 0) {
        player.setSpeed(speedTo);
      }
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("orange")).setDescription(`\`🏃\` ${player.speed === 1 ? `The player speed has been set to **normal**` : `Increase the player speed to **${player.speed}x**`}.`));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = SpeedCommand;