const Command = require("../../struct/command.js");
const progress = require("string-progressbar");

class NowPlayingCommand extends Command {
  constructor() {
    super({
      id: "nowplaying",
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


      const { title, thumbnail, uri, duration } = player.queue.current;
      const end = (duration > 6.048e+8) ? " \`🔴\` LIVE" : new Date(duration).toISOString().slice(11, 19);

      const embed = this.client.BaseEmbed(message);
      embed.setAuthor("Now Playing");
      embed.setThumbnail(thumbnail);
      embed.setDescription(`[${title}](${uri})`);
      embed.addField("\u200b", new Date(player.position * player.speed).toISOString().slice(11, 19) + " [[" + progress(duration > 6.048e+8 ? player.position * player.speed : duration, player.position * player.speed, 15)[0] + "](https://www.youtube.com/watch?v=dQw4w9WgXcQ)]" + end, false);
      return message.channel.send(embed);
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = NowPlayingCommand;