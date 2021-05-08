const Command = require("../../struct/command.js");

class SkipCommand extends Command {
  constructor() {
    super({
      id: "skip",
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message, [to = 1]) {
    try {
      const player = this.client.erela.get(message.guild.id);
      if (!player) return message.channel.send(this.client.BaseEmbed(message).setDescription("There is no player for this guild."));

      const { channel } = message.member.voice;

      if (!channel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You need to join a voice channel."));
      if (channel.id !== player.voiceChannel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You're not in the same voice channel."));
      if (!player.queue.current)  return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` There is no music playing."));

      const { title } = player.queue.current;
      const skipTo = to ? parseInt(to, 10) : null;
      if (!isNaN(skipTo) && skipTo < player.queue.length) {
        player.stop(skipTo);
      } else {
        player.stop();
      }
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("orange")).setDescription(`\`⏭️\` ${title} was skipped.`));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = SkipCommand;