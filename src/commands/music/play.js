const Command = require("../../struct/command.js");

class PlayCommand extends Command {
  constructor() {
    super({
      id: "play",
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
        if (player && player.paused) {
          player.pause(false);
          return message.channel.send(this.client.BaseEmbed(message).setDescription("`⏯` Resumed the player."));
        }
        if(!query.length > 0) {
          if (message.attachments.size > 0) {
            // Check if a file was uploaded to play instead
            const fileTypes = ["mp3", "mp4", "wav", "m4a", "webm", "aac", "ogg"];
            const url = message.attachments.first().url;
            for (let i = 0; i < fileTypes.length; i++) {
              if (url.endsWith(fileTypes[i])) {
                query.push(url);
              }
            }
            if (!query) return message.channel.send(this.client.BaseEmbed(message).setColor(this.client.color("red")).setDescription(`\`❌\` There was an error while playing: \`IMAGE/INVALID_FILE\``));
          } else {
            query = await this.client.prompt.reply(message.channel, "What song, do you want me to play?", { userID : message.author.id });
          }
        }
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
          const track = res.tracks[0];
          player.queue.add(track);

          if (!player.playing && !player.paused && !player.queue.size) player.play();
          return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎵\` Added Track: **[${track.title}](${track.uri}).**`));
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
        const track = res.tracks[0];
        guild.queue.add(track);

        if (!guild.playing && !guild.paused && !guild.queue.size) guild.play();
        return message.channel.send(this.client.BaseEmbed(message).setDescription(`\`🎵\` Added Track: **[${track.title}](${track.uri}).**`));
    }

    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }
}

module.exports = PlayCommand;