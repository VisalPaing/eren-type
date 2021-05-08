const { MessageEmbed } = require("discord.js");
const { Manager } = require("erela.js");
const Spotify  = require("erela.js-spotify");
const Deezer  = require("erela.js-deezer");
const Facebook = require("erela.js-facebook");
require("./struct/player");

module.exports = async (client, config) => {
  let erela = { config : config };
  if (erela.config.plugin.enable) {
    // Assign Manager to the client variable
    client.erela = new Manager({
      autoPlay: true,
      // The nodes to connect to, optional if using default lavalink options
      nodes: erela.config.nodes,
      plugins: [
        new Spotify({
          clientID: erela.config.plugin.spotify.clientID || null,
          clientSecret: erela.config.plugin.spotify.secret || null,
        }),
        new Deezer({ playlistLimit: 1, albumLimit:1 }),
        new Facebook(),
      ],
      // Method to send voice data to Discord
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        // NOTE: FOR ERIS YOU NEED JSON.stringify() THE PAYLOAD
        if (guild) guild.shard.send(payload);
      }
    });
  } else {
    // Assign Manager to the client variable
    client.erela = new Manager({
      autoPlay: true,
      // The nodes to connect to, optional if using default lavalink options
      nodes: erela.config.nodes,
      // Method to send voice data to Discord
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        // NOTE: FOR ERIS YOU NEED JSON.stringify() THE PAYLOAD
        if (guild) guild.shard.send(payload);
      }
    });
  }

  // Emitted whenever a node connects
  client.erela.on("nodeConnect", node => {
    client.Log().success("Erela", `Node connected: ${node.options.identifier}`);
  });

  // Emitted whenever a node create
  client.erela.on("nodeCreate", node => {
    client.Log().success("Erela", `Node created: ${node.options.identifier}`);
  });

  // Emitted whenever a node disconnected
  client.erela.on("nodeDisconnect", node => {
    client.Log().warn("Erela", `Node disconnected: ${node.options.identifier}`);
  });

  // Emitted whenever a node destroyed
  client.erela.on("nodeDestroy", node => {
    client.Log().error("Erela", `Node destroyed: ${node.options.identifier}`);
  });

  // Emitted whenever a node encountered an error
  client.erela.on("nodeError", (node, error) => {
    client.Log().error("Erela", `Node destroyed: ${node.options.identifier} => encountered an error: ${error.message}.`);
  });

  // Listen for when the client becomes ready
  client.once("ready", () => {
    // Initiates the erela and connects to all the nodes
    client.erela.init(client.user.id);
    client.Log().success("Erela", `Node logged: ${client.user.tag}`);
  });

  // THIS IS REQUIRED. Send raw events to Erela.js
  client.on("raw", d => client.erela.updateVoiceState(d));

  // Emitted the player track
  client.erela.on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    const end = (track.duration > 6.048e+8) ? "\`🔴\` LIVE" : new Date(track.duration).toISOString().slice(11, 19);
    // Send a message when the track starts playing with the track name and the requester's Discord tag, e.g. username#discriminator
    const embed = new MessageEmbed().setColor(client.color("default")).setTimestamp();
    embed.setAuthor("Now Playing");
    embed.setDescription(`[${track.title}](${track.uri})`);
    embed.setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`);
    embed.addField("\u200b", [
      `**❯ Duration:** ${end}`,
      `**❯ Song By:** ${track.author}`,
      player.queue.length > 0 ? `**❯ Queue:** ${player.queue.length} Songs` : ""
    ].join("\n"));
    embed.setFooter(track.requester.username, track.requester.displayAvatarURL({dynamic: true}));
    if (channel) channel.send(embed).then(m => m.delete({ timeout: (track.duration < 6.048e+8) ? track.duration : 60000 }));

    // clear timeout (for queueEnd event)
    if (player.timeout != null) return clearTimeout(player.timeout);
  });

  // Emitted the player queue ends
  client.erela.on("queueEnd", player => {

    // Don't leave channel if 24/7 mode is active
    if (player.twentyFourSeven) return;

    // When the queue has finished
    player.timeout = setTimeout(() => {
      const channel = client.channels.cache.get(player.textChannel);
      const embed = new MessageEmbed().setColor(client.color("default"));
      embed.setTitle(`Queue has ended.`);
      embed.setDescription(`I left the \`${client.channels.cache.get(player.voiceChannel) ? client.channels.cache.get(player.voiceChannel).name : "UNKNOWN"}\` channel because the Queue was empty.`);
      channel.send(embed);
      player.destroy();
    }, 180000);
  });

  // Emitted the player move
  client.erela.on("playerMove", (player, currentChannel, newChannel) => {
    client.Log().warn("Erela", newChannel ? `Player moved to [${newChannel}]` : "Someone disconnected me from voice channel.");
    if(!newChannel) {
        const embed = new MessageEmbed().setColor(client.color("default"));
        embed.setTitle(`Queue has ended.`);
        embed.setDescription(`The queue has ended as I was kicked from the voice channel`);
        return player.destroy();
    }

    player.voiceChannel = client.channels.cache.get(newChannel);;
    if (player.paused) return;
    setTimeout(() => {
      player.pause(true);
      setTimeout(() => player.pause(false), client.ws.ping * 2);
    }, client.ws.ping * 2);
  });

  function format(millis) {
    try {
      var h = Math.floor(millis / 3600000),
        m = Math.floor(millis / 60000),
        s = ((millis % 60000) / 1000).toFixed(0);
      if (h < 1) return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + " | " + (Math.floor(millis / 1000)) + " Seconds";
      else return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + " | " + (Math.floor(millis / 1000)) + " Seconds";
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  }
};