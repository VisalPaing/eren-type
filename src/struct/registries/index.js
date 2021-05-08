function loadEvents(client) {
  const { sync } = require("glob");
  const { resolve } = require("path");
  const Event = require("../event.js");
  const didYouMean = require("didyoumean2").default;
  const listeners = ["channelCreate", "channelDelete", "channelPinsUpdate", "channelUpdate", "clientUserGuildSettingsUpdate", "clientUserSettingsUpdate", "emojiCreate", "emojiDelete", "emojiUpdate", "guildBanAdd", "guildBanRemove", "guildCreate", "guildDelete", "guildMemberAdd", "guildMemberAvailable", "guildMemberRemove", "guildMembersChunk", "guildMemberSpeaking", "guildMemberUpdate", "guildUnavailable", "guildUpdate", "messageDelete", "messageDeleteBulk", "messageReactionAdd", "messageReactionRemove", "messageReactionRemoveAll", "message", "messageUpdate", "presenceUpdate", "ready", "reconnecting", "resume", "roleCreate", "roleDelete", "roleUpdate", "typingStart", "typingStop", "userNoteUpdate", "userUpdate", "voiceStateUpdate", "debug", "error", "warn", "disconnect", ];

  const eventFiles = sync(resolve("./src/events/**/*.js"));
  for (const filepath of eventFiles) {
    delete require.cache[require.resolve(filepath)];
    const File = require(filepath);
    if (!(File.prototype instanceof Event)) return;
    const event = new File();
    if (!(event.id)) return console.error(`${filepath} > Missing 'event.id'`);
    if (!(listeners.some((listener) => listener === event.id))) {
      const listener = didYouMean(event.id.toLowerCase(), listeners);
      if (listener) return console.error(`${filepath} > 'event.id' invalid event listener, did you mean? '${listener}'`);
    }
    event.client = client;
    event.filepath = filepath;
    client.events.set(event.id, event);
    const emitter = event.emitter ? typeof event.emitter === "string" ? client[event.emitter] : emitter : client;
    emitter[event.type ? "once" : "on"](event.id, (...args) => event.do(...args));

  }
}

function loadCommands(client) {
  const { sync } = require("glob");
  const { resolve } = require("path");
  const Command = require("../command.js");

  const commandFiles = sync(resolve("./src/commands/**/*.js"));
  for (const filepath of commandFiles) {
    delete require.cache[require.resolve(filepath)];
    const File = require(filepath);
    if (!(File.prototype instanceof Command)) return;
    const command = new File();
    command.client = client;
    command.filepath = filepath;
    client.commands.set(command.id, command);
  }
}

function loadMonitor(client){
  const ms = require("ms");
  const PrettyError = require("pretty-error");
  const pe = new PrettyError();


  client.on("error", (error) => {
    client.Log().error("Discord Error", error);
  });

  client.on("guildUnavailable", (guild) => {
    client.Log().error("Discord Error", `${guild.name} is unreachable, likely due to outage`);
  });

  client.on("invalidated", () => {
    client.Log().error("Discord Error", `Client session has become invalidated.`);
    client.destroy();
  });

  client.on("rateLimit", (ratelimit) => {
    client.Log().error("Discord Error", `Client is being rate limited.
    Timeout: ${ms(ratelimit.timeout)} ms
    Limit: ${ratelimit.limit}
    Method: ${ratelimit.method}
    Path: ${ratelimit.path}
    Route: ${ratelimit.route}`);
  });

  client.on("warn", (info) => {
    client.Log().warn("Discord Warning", info);
  });

  client.on("debug", (bug) => {
    client.Log().debug("Discord Debug", bug);
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  const doingAction = false;

  function shutdown(signal) {
    client.Log().success("Discord Bot", "Waiting for safe shutdown due to " + signal + "!");
    waitForShutdown(signal);
  }

  async function waitForShutdown(signal) {
    if (doingAction) {
      setImmediate(waitForShutdown, signal);
    } else {
      client.Log().warn("Discord Bot", "Bot shutting down now due to " + signal + "!");
      try {
        client.on("ready", () => this.guilds.cache.get("818413754051723285").channels.cache.get("829632750045626399").send("Bot shutting down now due to " + signal + "!")
        .then(() => {
          new Promise((resolve) => setTimeout(resolve, 1000));
          client.Log().warn("Discord Bot", "Safe! shutting down...");
          client.destroy();
          process.exit();
        }));
      } catch(e) { console.log(e); }
    }
  }


  process.on("uncaughtException", (e) => {
    e.stack = e.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    client.Log().error("Uncaught Exception", pe.render(e));
    process.exit(1);
  });

  process.on("uncaughtExceptionMonitor", (e) => {
    e.stack = e.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    client.Log().error("Uncaught Exception Monitor", pe.render(e));
    process.exit(1);
  });

  process.on("beforeExit", (code) => { // eslint-disable-line no-unused-vars
    console.log("=== before Exit ===".toUpperCase());
  });

  process.on("exit", (code) => { // eslint-disable-line no-unused-vars
    console.log("=== exit ===".toUpperCase());
  });

  process.on("multipleResolves", (type, promise, reason) => { // eslint-disable-line no-unused-vars
    console.log("=== multiple Resolves ===".toUpperCase());
  });
}

module.exports = {
  loadEvents,
  loadCommands,
  loadMonitor
};