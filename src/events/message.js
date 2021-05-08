const Event = require("../struct/event.js");

class MessageEvent extends Event {
  constructor() {
    super({
      id: "message",
      once: false,
    });
  }

  async do(message) {
    if (message.author.bot || message.author.id === message.client.user.id || message.bot) return;
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixREGEX = new RegExp(`^(${this.client.prefix ?`${escapeRegex(this.client.prefix)}|`: ""}<@!?${this.client.user.id}>|${this.client.user.username.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|<@!?${message.author.id}> cmd|${message.author.username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} cmd)`, "i", "(\s+)?"); // eslint-disable-line no-useless-escape
    var prefixUSED = message.content.toLowerCase().match(prefixREGEX);
    prefixUSED = prefixUSED && prefixUSED.length && prefixUSED[0]; // eslint-disable-line no-unused-vars

    let args, commandName; //Arguments|CommandName
    if (!prefixUSED) {
      if (!prefixUSED && !(message.mentions.users.first() && message.mentions.users.first().id === message.client.user.id)) return;
      args = message.content.trim().split(/ +/g);
      commandName = args.shift().toLowerCase();
    } else {
      args = message.content.slice(prefixUSED.length).trim().split(/ +/g);
      commandName = args.shift().toLowerCase();
    }

    let command = this.client.commands.get(commandName) || this.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (command) {
      const sendPerm = this.client.sendPerm(message);
      if(!sendPerm.status) return message.channel.send(sendPerm.cnt);

      try {
        this.client.requirements(message, command, args);
        command.do(message, args);
      } catch (error) {
        const msg = error.dm ? await message.author.send(error.cnt) : await message.channel.send(error.cnt);
        console.log(error.timeout)
        setTimeout(() => msg.delete(), error.timeout);
      }
    } else {
      const didYouMean = require("didyoumean2").default;
      const commands = this.client.commands.map((c) => c.id);
      const commandFound = didYouMean(commandName.toLowerCase(), commands);
      if(!(shuffle([true, false])[Math.floor(Math.random() * [true, false].length)]) && commandFound) {
        const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya", "hai", "si", "sí", "oui", "はい", "correct", "opo"];
        const youmean = await this.client.prompt.reply(message.channel, `Did you mean? \`${commandFound}\` command`, { userID : message.author.id });
        if(youmean && yes.some((str) => youmean.toLowerCase().includes(str))) {
          try {
            this.client.requirements(message, this.client.commands.get(commandFound), args);
            this.client.commands.get(commandFound).do(message, message.content.slice(commandFound.length).trim().split(/ +/g).slice(1));
          } catch (error) {
            const msg = error.dm ? await message.author.send(error.cnt) : await message.channel.send(error.cnt);
            setTimeout(() => msg.delete(), error.timeout);
          }return;
        } else return message.channel.send("Ok, make sure the command your getting are exist.");
      } else {
        // Do nothing
      }

      const master = await this.client.search.user(message, "817238971255488533");
      if(!(master)) console.log("Oh! noooooo.. where r u master!");
      let bot = {}, owner = {}, res;
      bot.name = this.client.user.username;
      bot.birthdate = "11/2/2002";
      bot.prefix = this.client.prefix;
      bot.gender = "male";
      bot.description = "I'm a Multipurpose Discord Bot with many features.";
      owner.id = master.id;
      owner.username = master.username;
      owner.discriminator = master.discriminator;
      
      if(!(message.content.trim().split(" ").length > 1) && message.content.match(/^(?:<@!?)?(\d{16,22})>/gi)) {
        res = await this.client.chat("", message.author.id, bot, owner);
        if(!(res.status)) return console.log(res.cnt);
        const ask = await this.client.prompt.reply(message.channel, res.cnt, { userID : message.author.id });
        if(!(ask)) return;
        const commandFound = didYouMean(ask.toLowerCase(), commands);
        const yes = ["yes", "y", "ye", "yeah", "yup", "yea", "ya", "hai", "si", "sí", "oui", "はい", "correct", "opo"];
        if(!(commandFound)) {
          res = await this.client.chat(ask, message.author.id, bot, owner);
          if(!(res.status)) return console.log(res.cnt);
          return message.channel.send(res.cnt);
        }
        const youmean = await this.client.prompt.reply(message.channel, `Did you mean? \`${commandFound}\` command`, { userID : message.author.id });
        if(youmean && yes.some((str) => youmean.toLowerCase().includes(str))) {
          try {
            this.client.requirements(message, this.client.commands.get(commandFound), args);
            this.client.commands.get(commandFound).do(message, message.content.slice(commandFound.length).trim().split(/ +/g).slice(1));
          } catch (error) {
            error.dm ? message.author.send(error.cnt) : message.channel.send(error.cnt);
          } return;
        } else return message.channel.send("Ok, make sure the command your getting are exist.");
      } else {
        res = await this.client.chat(`${message.content}`, message.author.id, bot, owner);
        if(!(res.status)) return console.log(res.cnt);
        return message.channel.send(res.cnt);
      }
    }
  }
}

function shuffle(array) {
  const arr = array.slice(0);
  new Promise(async(resolve) => {
    resolve(2);
    try{
      for (let i = arr.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    } catch {}
  })
  return arr;
}

module.exports = MessageEvent;