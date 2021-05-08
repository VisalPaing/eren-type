const Command = require("../../struct/command.js");

class VolumeCommand extends Command {
  constructor() {
    super({
      id: "volume",
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message, [volume]) {
    try {
      
      const newVolume = parseInt(volume, 10);
      const player = this.client.erela.get(message.guild.id);
      if (!player) return message.channel.send(this.client.BaseEmbed(message).setDescription("There is no player for this guild."));

      const { channel } = message.member.voice;

      if (!channel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You need to join a voice channel."));
      if (channel.id !== player.voiceChannel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You're not in the same voice channel."));

      if (isNaN(newVolume)) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("blue")).setDescription(`\`🔉\` Current volume ${player.volume}`));
      if (!newVolume || newVolume < 1 || newVolume > 100) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You need to give me a volume between 1 and 100."));

      player.setVolume(newVolume);
      return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("green")).setDescription(`\`🔊\` Set the player volume to \`${player.volume}\`.`));
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = VolumeCommand;