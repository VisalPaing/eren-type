const Command = require("../../struct/command.js");

class TwentyFourSeven extends Command {
  constructor() {
    super({
      id: "24/7",
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

      // toggle 24/7 mode off and on
      if (player.twentyFourSeven) {
        player.twentyFourSeven = false;
        return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🅾️` 24/7 mode is now off."));
      } else {
        player.twentyFourSeven = true;
        return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("green")).setDescription("`⏺️` 24/7 mode is now on."));
      }

    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = TwentyFourSeven;