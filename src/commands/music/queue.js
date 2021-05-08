const Command = require("../../struct/command.js");

class QueueCommand extends Command {
  constructor() {
    super({
      id: "queue",
      ratelimit: 5,
      category: "music",
    });
  }

  async do(message, [...query]) {
    try {
      const player = this.client.erela.get(message.guild.id);
      if (!player) return message.channel.send(this.client.BaseEmbed(message).setDescription("There is no player for this guild."));

      const queue = player.queue;
      const embed = this.client.BaseEmbed(message).setAuthor(`Queue for ${message.guild.name}`);

      // change for the amount of tracks per page
      const multiple = 10;
      const page = query.length && Number(query[0]) ? Number(query[0]) : 1;

      const end = page * multiple;
      const start = end - multiple;

      const tracks = queue.slice(start, end);

      if (queue.current) embed.addField("Current", `[${queue.current.title}](${queue.current.uri})`);

      if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
      else embed.setDescription(tracks.map((track, i) => `${start + (++i)} - [${track.title}](${track.uri})`).join("\n"));

      const maxPages = Math.ceil(queue.length / multiple);

      embed.setFooter(message.author.username + ` | Page ${page > maxPages ? maxPages : page} of ${maxPages}`, message.author.displayAvatarURL({dynamic: true}));

      return message.channel.send(embed);
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = QueueCommand;