const Command = require("../../struct/command.js");

class ShuffleCommand extends Command {
  constructor() {
    super({
      id: "shuffle",
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

      player.queue.shuffle();
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("green")).setDescription(`\`🔀\` shuffled the player.`));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = ShuffleCommand;