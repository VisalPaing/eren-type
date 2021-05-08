function resolveSendPerm(message){
  let final = { status : false, cnt : "" };
  const { MessageEmbed } = require("discord.js");

  if (message.guild && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
    try {
      final.cnt = "It seems like I can't send messages in that channel!";
      message.author.send(new MessageEmbed().setColor(resolveColor("red")).setDescription(final.cnt));
    } catch {
      final.cnt = `Tried to send a DM about not being able to deliver message to the specified channel but sending the DM failed!`;
      console.error(final.cnt);
    }
  } else final = { status : true, cnt : "passed" };

  return final;
}

function resolveRequired(message, command, args){

  const userPermissions = command.userPermissions;
  const clientPermissions = command.clientPermissions;
  const missingPermissions = [];

  //Guild Only
  if (command.guildOnly && !message.guild) {
    if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🚫");
    throw { dm : true, timeout: 5000, cnt : "This command can only be used in guilds." };
  }//Owner Only
  else if (command.ownerOnly && !message.client.owners.includes(message.author.id)) {
    if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🚫");
    throw { dm : false, timeout: 5000, cnt : "This command can only be used by the owner of this bot." };
  }//Required Args
  else if (command.requiredArgs && args.length < command.requiredArgs) {
    if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🚫");
    throw { dm : false, timeout: 5000, cnt : `That is not a valid usage of this command check out \`${message.client.prefix}help ${command.id}\` for more info!` };
  }//User Permissions
  else if (message.guild && !message.client.owners.includes(message.author.id) && userPermissions.length) {
    for (let i = 0; i < userPermissions.length; i++) {
      const hasPermission = message.member.hasPermission(userPermissions[i]);
      if (!hasPermission) {
        missingPermissions.push(userPermissions[i]);
      }
    }
    if (missingPermissions.length) {
      if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🚫");
      throw { dm : false, timeout: 5000, cnt : `Your missing these required permissions: ${missingPermissions.join(", ")}` };
    }
  }//Client Permissions
  else if (message.guild && clientPermissions.length) {
    for (let i = 0; i < clientPermissions.length; i++) {
      const hasPermission = message.guild.me.hasPermission(clientPermissions[i]);
      if (!hasPermission) {
        missingPermissions.push(clientPermissions[i]);
      }
    }
    if (missingPermissions.length) {
      if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🚫");
      throw { dm : false, timeout: 5000, cnt : `I"m missing these required permissions: ${missingPermissions.join(", ")}` };
    }
  } else {}

  const { Collection } = require("discord.js");
  const ms = require("pretty-ms");

  if (!message.client.ratelimits.has(command.id)) message.client.ratelimits.set(command.id, new Collection());
  const now = Date.now();
  const ratelimit = message.client.ratelimits.get(command.id);
  const cooldown = command.ratelimit * 1000;

  if (ratelimit.has(message.author.id)) {
    const expire = ratelimit.get(message.author.id) + cooldown;
    if (now < expire) {
      const remaining = (expire - now);
      if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🚫");
      throw { dm : false, timeout: remaining, cnt : `Please wait **${ms(remaining, { verbose: true })}** before attempting to use the \`${command.id}\` command again.` };
    }
  } else {
    if ((message.guild && message.channel.permissionsFor(message.client.user).has(["ADD_REACTIONS", "READ_MESSAGE_HISTORY"])) || !message.guild) message.react("🆗");
  }
  ratelimit.set(message.author.id, now);
  setTimeout(() => ratelimit.delete(message.author.id), cooldown);
}

const Colors = {
  default: 3553599,
  white: 0xffffff,
  aqua: 0x1abc9c,
  green: 0x2ecc71,
  blue: 0x3498db,
  yellow: 0xffff00,
  purple: 0x9b59b6,
  gold: 0xf1c40f,
  orange: 0xe67e22,
  red: 0xe74c3c,
  grey: 0x95a5a6,
  navy: 0x34495e
};

function resolveColor(color) {
  color = color.toLowerCase();
  if (typeof color === "string") {
    if (color === "random") {
      var lum = -0.10;
      var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, "");
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var random = "#", c, i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        random += ("00" + c).substr(c.length);
      }
      return color = random;
    }
    //else if (color === "default") color = 0;
    else color = Colors[color] || parseInt(color.replace("#", ""), 16);
  } else if (Array.isArray(color)) {
    color = (color[0] << 16) + (color[1] << 8) + color[2];
  }

  if (color < 0 || color > 0xffffff) throw new Error("COLOR_RANGE");
  else if (color && isNaN(color)) throw new Error("COLOR_CONVERT");
  var red = (color >> 16) & 255;
  var green = (color >> 8) & 255;
  var blue = color & 255;

  const rgb = (red << 16) | (green << 8) | (blue << 0);
  return "#" + (0x1000000 + rgb).toString(16).slice(1);
}

module.exports = {
  sendPerm : resolveSendPerm,
  requirements : resolveRequired,
  color : resolveColor
};