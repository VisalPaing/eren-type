const Command = require("../../struct/command.js");

class RepeatCommand extends Command {
  constructor() {
    super({
      id: "repeat",
      aliases: [],
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message, [...query]) {
    try {
      const player = this.client.erela.get(message.guild.id);
      if (!player) return message.channel.send(this.client.BaseEmbed(message).setDescription("There is no player for this guild."));


      const { channel } = message.member.voice;

      if (!channel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You need to join a voice channel."));
      if (channel.id !== player.voiceChannel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You're not in the same voice channel."));

      if (query.length && /queue/i.test(query[0])) {
        player.setQueueRepeat(!player.queueRepeat);
        const queueRepeat = player.queueRepeat ? "Enabled" : "Disabled";
        return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color(player.queueRepeat ? "green" : "red")).setDescription(`\`🔁\` ${queueRepeat} queue repeat.`));
      }

      player.setTrackRepeat(!player.trackRepeat);
      const trackRepeat = player.trackRepeat ? "Enabled" : "Disabled";
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color(player.trackRepeat ? "green" : "red")).setDescription(`\`🔁\` ${trackRepeat} track repeat.`));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = RepeatCommand;