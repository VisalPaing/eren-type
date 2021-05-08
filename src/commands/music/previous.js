const Command = require("../../struct/command.js");

class PreviousCommand extends Command {
  constructor() {
    super({
      id: "previous",
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
      if (!player.queue.current)  return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` There is no music playing."));
      if (!player.queue.previous)  return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` There is no previous music."));

      const { title } = player.queue.current;

      // Start playing the previous song
      player.queue.unshift(player.queue.previous);
      player.stop();

      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("orange")).setDescription(`\`⏮️\` ${title} was skipped, the previous music is now playing. `));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = PreviousCommand;