const Command = require("../../struct/command.js");

class SearchCommand extends Command {
  constructor() {
    super({
      id: "search",
      ratelimit: 3,
      category: "music",
      clientPermissions: ["CONNECT", "SPEAK"]
    });
  }

  async do(message, [...query]) {
    try {
      const guild = this.client.erela.get(message.guild.id);
      if (!message.member.voice.channel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`⛔` You must join voice channel to do this."));
      if(!(message.member.voice.channel.joinable || message.member.voice.channel.speakable)) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`⛔` I can't join, speak (in) the voice channel."));

      let res;
      if (!guild) {
        const player = await this.client.erela.create({
          guild: message.guild.id,
          voiceChannel: message.member.voice.channel.id,
          textChannel: message.channel.id,
          selfDeafen: true,
        });
        if (player.state !== "CONNECTED") player.connect();
        if(!query.length > 0) query = await this.client.prompt.reply(message.channel, "What song, do you want me to play?", { userID : message.author.id });
        try {
          res = await this.client.erela.search(query, message.author);
          if (res.loadType === "LOAD_FAILED") {
            if (!player.queue.current) player.destroy();
            throw res.exception;
          }
        } catch (err) {
          return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`❌\` There was an error while searching: ${err.message}`));
        }

        switch (res.loadType) {
        case "NO_MATCHES":
          if (!player.queue.current) player.destroy();
          return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` There were no results found."));
        case "TRACK_LOADED":
          player.queue.add(res.tracks[0]);

          if (!player.playing && !player.paused && !player.queue.size) player.play();
          return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎵\` Added track: **${res.tracks[0].title}.**`));
        case "PLAYLIST_LOADED":
          player.queue.add(res.tracks);

          if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
          return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎶\` Added playlist: **${res.playlist.name}** with ${res.tracks.length} tracks.`));
        case "SEARCH_RESULT":
          // eslint-disable-next-line no-case-declarations
          let max = 5, collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
          if (res.tracks.length < max) max = res.tracks.length;

          // eslint-disable-next-line no-case-declarations
          const results = res.tracks.slice(0, max).map((track, index) => `**${++index} ❯ ** [${track.title.length > 70 ? track.title + "..." : track.title}](${track.uri})`).join("\n");
          // eslint-disable-next-line no-case-declarations
          const embed = this.client.BaseEmbed(message);
          embed.setAuthor("Select a song to play and send the number next to it, Time: 30 seconds to select.");
          embed.setDescription(results);
          embed.setFooter(`${message.author.username} | Use "end" to cancel`, message.author.displayAvatarURL({dynamic: true}));
          // eslint-disable-next-line no-case-declarations
          const msg = await message.channel.send(embed);

          try {
            collected = await message.channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ["time"] });
          } catch (e) {
            if (!player.queue.current) player.destroy();
            return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You didn't provide a selection."));
          }
          // eslint-disable-next-line no-case-declarations
          const first = collected.first().content;

          if (first.toLowerCase() === "end") {
            if (!player.queue.current) player.destroy();
            return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("Cancelled selection."));
          }

          if (isNaN(first)) return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` Invalid number provided, search cancelled."));
          // eslint-disable-next-line no-case-declarations
          const index = Number(first) - 1;
          if (index < 0 || index > max - 1) return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`🚫\` The number you provided too small or too big (1-${max}).`));

          // eslint-disable-next-line no-case-declarations
          const track = res.tracks[index];
          player.queue.add(track);

          if (!player.playing && !player.paused && !player.queue.size) player.play();
          return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎵\` Added Track: **${track.title}.**`));
        }
      }

      if (message.member.voice.channel.id !== guild.voiceChannel) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`⛔` You must join voice channel same as me to do this."));

      if (guild.state !== "CONNECTED") guild.connect();
      if (guild && guild.paused) {
        guild.pause(false);
        return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("green")).setDescription("`⏯` Resumed the player."));
      }

      if(!query.length > 0) query = await this.client.prompt.reply(message.channel, "What song, do you want me to play?", { userID : message.author.id });
      try {
        res = await this.client.erela.search(query, message.author);
        if (res.loadType === "LOAD_FAILED") {
          if (!guild.queue.current) guild.destroy();
          throw res.exception;
        }
      } catch (err) {
        return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`❌\` there was an error while searching: ${err.message}`));
      }

      switch (res.loadType) {
      case "NO_MATCHES":
        if (!guild.queue.current) guild.destroy();
        return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` There were no results found."));
      case "TRACK_LOADED":
        guild.queue.add(res.tracks[0]);

        if (!guild.playing && !guild.paused && !guild.queue.size) guild.play();
        return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎵\` Added track: **${res.tracks[0].title}.**`));
      case "PLAYLIST_LOADED":
        guild.queue.add(res.tracks);

        if (!guild.playing && !guild.paused && guild.queue.totalSize === res.tracks.length) guild.play();
        return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎶\` Added playlist: **${res.playlist.name}** with ${res.tracks.length} tracks.`));
      case "SEARCH_RESULT":
        // eslint-disable-next-line no-case-declarations
        let max = 5, collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
        if (res.tracks.length < max) max = res.tracks.length;

        // eslint-disable-next-line no-case-declarations
        const results = res.tracks.slice(0, max).map((track, index) => `**${++index} ❯ ** [${track.title.length > 70 ? track.title + "..." : track.title}](${track.uri})`).join("\n");
        // eslint-disable-next-line no-case-declarations
        const embed = this.client.BaseEmbed(message);
        embed.setAuthor("Select a song to play and send the number next to it, Time: 30 seconds to select.");
        embed.setDescription(results);
        embed.setFooter(`${message.author.username} | Use "end" to cancel`, message.author.displayAvatarURL({dynamic: true}));
        // eslint-disable-next-line no-case-declarations
        const msg = await message.channel.send(embed);

        try {
          collected = await message.channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ["time"] });
        } catch (e) {
          if (!guild.queue.current) guild.destroy();
          return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` You didn't provide a selection."));
        }

        // eslint-disable-next-line no-case-declarations
        const first = collected.first().content;

        if (first.toLowerCase() === "end") {
          if (!guild.queue.current) guild.destroy();
          return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("Cancelled selection."));
        }

        if (isNaN(first)) return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription("`🚫` Invalid number provided, search cancelled."));
        // eslint-disable-next-line no-case-declarations
        const index = Number(first) - 1;
        if (index < 0 || index > max - 1) return msg.edit(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`🚫\` The number you provided too small or too big (1-${max}).`));

        // eslint-disable-next-line no-case-declarations
        const track = res.tracks[index];
        guild.queue.add(track);

        if (!guild.playing && !guild.paused && !guild.queue.size) guild.play();
        return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎵\` Added Track: **${track.title}.**`));
      }

    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = SearchCommand;