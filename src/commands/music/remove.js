const Command = require("../../struct/command.js");

class RemoveCommand extends Command {
  constructor() {
    super({
      id: "remove",
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

      const removeTo = to[0] ? parseInt(to[0], 10) : null;
      if (removeTo !== null && (isNaN(removeTo) || removeTo < 1 || removeTo > player.queue.length)) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`🚫\` You need to give me a remove between 1 and ${player.queue.length}.`));
      const removed = player.queue.remove(removeTo);
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("orange")).setDescription(`\`🗑️\` ${removed.title} was removed from queue.`));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = RemoveCommand;