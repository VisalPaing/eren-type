const Command = require("../../struct/command.js");

const pkg = require(process.cwd() + "/package.json");
const os = require("os");
const child = require("child_process");

const si = require("systeminformation");
const moment = require("moment");
require("moment-duration-format");

const verificationLevels = {
    NONE: ":black_circle: None",
    LOW: ":green_circle: Low",
    MEDIUM: ":yellow_circle: Medium",
    HIGH: ":orange_circle: High",
    VERY_HIGH: ":red_circle: Very High",
  },
  regions = {
    brazil: ":flag_br: Brazil",
    europe: ":flag_eu: Europe",
    hongkong: ":flag_hk: Hong Kong",
    india: ":flag_in: India",
    japan: ":flag_jp: Japan",
    russia: ":flag_ru: Russia",
    singapore: ":flag_sg: Singapore",
    southafrica: ":flag_af: South Africa",
    sydney: ":flag_sy: Sydney",
    "us-central": ":flag_us: US Central",
    "us-east": ":flag_us: East",
    "us-west": ":flag_us: US West",
    "us-south": ":flag_us: US South",
  },
  status = {
    offline: ":black_circle: This user is currently offline",
    dnd: ":red_circle: This user has currently do not disturb mode on",
    idle: ":yellow_circle: This user is currently idle",
    online: ":green_circle: This user is currently online",
  };

class StatusCommand extends Command {
  constructor() {
    super({
      id: "status",
      ratelimit: 5,
      category: "utilities"
    });
  }

  async do(message, [...value]) {
    let member = null;
    if(value) member = await this.client.search.member(message, value.join(" "));
    try {
      if (!(value.length === 0)) {
        if(!member && value[0].match(/\d{16,22}$/gi)) {
          try {
            let user = await this.client.search.user(message, value.join(" "));
            let fetch = require("node-fetch");
            let image;
            image = await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`).catch(() => null);
            if(!(image.status === 200)) image = await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`).catch(() => null);
            let avatar = image ? image.url :
              user.discriminator.endsWith(`0`) || user.discriminator.endsWith(`5`) ? `https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png` : user.discriminator.endsWith(`1`) || user.discriminator.endsWith(`6`) ? `https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png` : user.discriminator.endsWith(`2`) || user.discriminator.endsWith(`7`) ? `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png` : user.discriminator.endsWith(`3`) || user.discriminator.endsWith(`8`) ? `https://discordapp.com/assets/0e291f67c9274a1abdddeb3fd919cbaa.png` : user.discriminator.endsWith(`4`) || user.discriminator.endsWith(`9`) ? `https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png` : `Not Available`;

            const embed = this.client.BaseEmbed(message)
              .setDescription("User Information for" + ` **${user.username}** (ID: ${user.id})`)
              .setThumbnail(avatar)
              .addField("❯ User Details", [
                `• ID: ${user.id}`, `• Username: ${user.username}`,
                `• Created At: ${moment(user.createdAt).format("L")}, ${moment(user.createdAt, "YYYYMMDD").fromNow()}`,
                `• Status: ${status[user.presence.status]}`,
                `• Activities: ${user.presence.activities.map((a) => a).join(" ")}`
                //`• Bot: **${user.bot ? "Yes" : "No"}**`
              ]);
            return message.channel.send(embed);
          } catch (e) {
            const embed = this.client.BaseEmbed(message)
              .setDescription(
                `**User not found, here's why.**
  • A user ID was not provided, get a user ID by going to\n \`User Settings -> Appearance (scroll down) -> Developer Mode (ON)\` \nAnd right click on someone, then press "Copy ID".
  • Your user ID was invalid, and could be a role, or channel ID.
  • Your ID leads nowhere.`);

            return message.channel.send(embed);
          }
        }

        if (!(member && member.user.id)) return message.channel.send("`❌` That member cannot be found on this server.");
        if ((value[0] === "bot") || member.user.id === this.client.user.id) {
          let npmver = "";

          child.exec("npm -version", async (e, s) => {
            try {
              npmver = s.split("\n");
              const embed = this.client.BaseEmbed(message);
              embed.setDescription(`Info on **${this.client.user.username}** (ID: ${this.client.user.id})`);
              //embed.setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }));

              embed.addField(`Operating System`,`**${(await si.osInfo()).distro} ${(await si.osInfo()).release} ${process.arch}**\n
                **Uptime** - ${moment.duration(os.uptime()).format("d [days] h [hrs] m [mins] s [secs]")}
                **Kernel** - ${(await si.osInfo()).kernel}
                **Model** - ${(await si.system()).model}
                **Manufacturer** - ${(await si.system()).manufacturer}`,true);
              embed.addField(`Hardware Memory`,`**${this.sizeize((await si.mem()).total)}** - Total
                **${this.sizeize((await si.mem()).used)}** - Used
                **${this.sizeize((await si.mem()).free)}** - Free\n
                **${this.sizeize((await si.mem()).active)}** - Active
                **${this.sizeize((await si.mem()).available)}** - Available`, true);
              embed.addField(`CPU Info`, `**${os.cpus()[0].model}** - Model
                **${(await si.cpu()).cores}** - Cores
                **${(await si.cpu()).physicalCores}** - Physical Cores
                **${(await si.cpu()).processors}** - Processors
                **${(await si.cpu()).speed}GHz** - Speed
                **${(await si.cpu()).vendor}** - Vendor`, true);
              embed.addField(`Versions`,
                `**${pkg.version}** - ${this.client.user.username}
                **[${!pkg.dependencies["discord.js"].startsWith("github") ? pkg.dependencies["discord.js"].slice(1) : "Github Commit"}](${!pkg.dependencies["discord.js"].startsWith("github")? `https://npmjs.com/package/discord.js/v/${pkg.dependencies["discord.js"].slice(1)}` : `https://github.com/discordjs/discord.js/commit/${pkg.dependencies["discord.js"].split("#").slice(1)}`})** - Discord.JS
                **[${process.version.slice(1)}](https://nodejs.org/download/release/${process.version})** - Node
                **[${npmver[0]}](https://www.npmjs.com/get-npm)** - NPM`, true);
              embed.addField(`Process Info`,
                `**${this.sizeize(process.memoryUsage().heapTotal)}** Total
                **${this.sizeize(process.memoryUsage().heapUsed)}** Used
                **${this.sizeize((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed))}** Free
                **${this.sizeize(this.getCombinedSize(getAllFiles(process.cwd() + "/src", null, "")))}** Node Folder`, true);
              embed.addField(`Disk Storage`, `
                **${this.sizeize((await si.fsSize())[0].size)}** - Total
                **${this.sizeize((await si.fsSize())[0].used)}** - Used
                **${this.sizeize(((await si.fsSize())[0].size - (await si.fsSize())[0].used))}** - Free`,true);
              embed.addField(`Uptime`,
                `**${moment.duration(process.uptime() * 1000).format("d [days] h [hrs] m [mins] s [secs]")}** - Node
                 **${moment.duration(message.client.uptime).format("d [days] h [hrs] m [mins] s [secs]")}** - Bot`, true);
              embed.addField(`Node.JS`,
                `**${process.pid}** - Process ID
                **${process.ppid}** - Parent Process ID`, true);
              embed.addField(`Links`,
                `**[Invitation](https://bot.shikishima.ga "Invite me in your server")
                [Support Server](https://discord.com/invite/n6EnQcQNxg "Join now")**`, true);
              return message.channel.send(embed);
            } catch (e) {
              return this.client.logs(message, e, "error");
            }
          });
        } else {
          const joinPosition = message.guild.members.cache.array().sort((a, b) => a.joinedAt - b.joinedAt);
          const embed = this.client.BaseEmbed(message);
          embed.setDescription("User Information for" + ` **${member.user.username}** (ID: ${member.id})`);
          embed.setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }));
          embed.addField("❯ User Details", [
            `• ID: ${member.id}`, `• Username: ${member.user.username}`,
            `• Created At: ${moment(member.user.createdAt).format("L")}, ${moment(member.user.createdAt, "YYYYMMDD").fromNow()}`,
            `• Status: ${status[member.presence.status]}`,
            `• Activities: ${member.presence.activities.map((a) => a).join(" ")}`
          ]);
          embed.addField("❯ Member Details", [
            `• Nickname: ${member.nickname ? member.nickname : "None"}`,
            `• Joined At: ${moment(member.joinedAt).format("L")}, ${moment(member.joinedAt, "YYYYMMDD").fromNow()}`,
            `• Join Position: ${joinPosition.findIndex((o) => o.user.id === member.user.id) === 0 ? 1 : joinPosition.findIndex((o) => o.user.id === member.user.id)}`
            //`• Roles: ${member.roles.cache.filter((role) => role.name !== "muted" && role.name !== "@everyone").map((r) => r).join(" ")}`
          ]);

          if(message.channel.permissionsFor(message.guild.me).has(["CREATE_INSTANT_INVITE", "VIEW_AUDIT_LOG"])){
            let invites = await message.guild.fetchInvites();
            let invitesMember = invites.filter(i => i.inviter && i.inviter.id === member.user.id);
            let invitesCode, invitesNum;
            if(invitesMember.size <= 0) {
              invitesCode = `**${member.displayName} didn't invite anyone to the server!**`;
            } else {
              invitesNum = 0;
              invitesMember.forEach(invite => invitesNum += invite.uses);
              invitesCode = `${invitesMember.map(i => i.code).join("\n")}`;
            }
            embed.addField("❯ Invite Details", [
              `• Code: ${invitesCode ? invitesCode : "None"}`,
              `${invitesNum ? "• No. Users Invited: " + invitesNum : "None"}`,
            ]);
          }
          return message.channel.send(embed);
        }
      } else {
        const { guild } = message;
        let rolemap = message.guild.roles.cache.sort((a, b) => b.position - a.position).filter((role) => role.name !== "muted" && role.name !== "@everyone").map((r) => r).join(" ");
        if (rolemap.length > 1024) rolemap = "To many roles to display";
        if (!rolemap) rolemap = "No roles to display";
        let emojis = guild.emojis.cache.map(e => `${e}`).join(" ") || "No Emojis found.";
        if (emojis.length > 1024) emojis = "Too many emojis to display.";
        if (!emojis) rolemap = "No emojis to display";
        //let onlineMembers = guild.members.cache.filter((mem) => mem.presence.status != "offline").size;
        //let offlineMembers = guild.members.cache.filter((mem) => mem.presence.status == "offline").size;
        //let bots = guild.members.cache.filter((mem) => mem.user.bot === true).size;
        let categories = guild.channels.cache.filter(channel => channel.type === "category").size;
        let textChannel = guild.channels.cache.filter(channel => channel.type === "text").size;
        let voiceChannel = guild.channels.cache.filter(channel => channel.type === "voice").size;
        let otherChannel = guild.channels.cache.size - textChannel - voiceChannel - categories;

        const Online = guild.members.cache.filter((mem) => mem.presence.status === "online"), Offline = await guild.members.cache.filter((mem) => mem.presence.status === "offline"), Idle = await guild.members.cache.filter((mem) => mem.presence.status === "idle"), Dnd = await guild.members.cache.filter((mem) => mem.presence.status === "dnd");
        const Bots = await guild.members.cache.filter((mem) => mem.user.bot), Humans = await guild.members.cache.filter((mem) => !mem.user.bot), Players = await guild.members.cache.filter((mem) => mem.presence.activities && mem.presence.activities[0] && mem.presence.activities[0].type === "PLAYING"), Websites = await guild.members.cache.filter((mem) => mem.presence.clientStatus && Object.keys(mem.presence.clientStatus).includes("web")), Desktop = await guild.members.cache.filter((mem) => mem.presence.clientStatus && Object.keys(mem.presence.clientStatus).includes("desktop")), Mobile = await guild.members.cache.filter((mem) => mem.presence.clientStatus && Object.keys(mem.presence.clientStatus).includes("mobile"));
        let SameTag = await guild.members.cache.map((mem) => mem.user.discriminator), Fake = [], Original = [];
        for (let i = 0; i < SameTag.length; i++) {
          if (Fake.includes(SameTag[i])) await Original.push(SameTag[i]);
          await Fake.push(SameTag[i]);
        }
        SameTag = Original.length;
        const embed = this.client.BaseEmbed(message);
        embed.setDescription("Guild Information for" + ` **${guild.name}** (ID: ${guild.id})`);
        embed.setThumbnail(guild.iconURL({size: 4096, dynamic: true}));
        embed.addField("❯ Channels", [
          `• ${voiceChannel} Voice`,
          `• ${textChannel} Text`,
          `• ${categories} Categories`,
          `• ${otherChannel} Other`
        ]);
        embed.addField("❯ Member", [
          `• Guild Owner: <@${guild.owner.id}> (ID: ${guild.owner.id})`,
          `• Total: ${guild.memberCount}`,
          `• Human: ${Humans.size}`,
          `• Bot: ${Bots.size}`,
          `• Online: ${Online.size}`,
          `• Idle: ${Idle.size}`,
          `• Do Not Distrub: ${Dnd.size}`,
          `• Offline: ${Offline.size}`,
          `• Playing: ${Players.size}`,
          `• Website: ${Websites.size}`,
          `• Desktop: ${Desktop.size}`,
          `• Mobile: ${Mobile.size}`,
          `• Same Discriminator: ${SameTag}`,
        ]);
        embed.addField("❯ Roles", [rolemap]);
        embed.addField("❯ Emojis", [emojis]);
        embed.addField("❯ Other", [
          `• Region: ${regions[guild.region]}`,
          `• Created At: ${moment(guild.createdAt).format("L")}, ${moment(guild.createdAt).fromNow()}`,
          `• Verification Level: ${verificationLevels[guild.verificationLevel]}`,
        ]);
        return message.channel.send(embed);
      }
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }

  sizeize(num) {
    let type = 0;
    let value = num;
    while(Math.trunc(value/1000)) { value = value / 1000; type++; }
    let size = value > 1 ? "Bytes" : "Byte";
    switch(type) {
    case 0 :
      size = value > 1 ? "Bytes" : "Byte";
      break;
    case 1:
      size = "KB";
      break;
    case 2:
      size = "MB";
      break;
    case 3:
      size = "GB";
      break;
    case 4:
      size = "TB";
      break;
    }
    return `${value.toString().slice(0, value.toString().indexOf(".") + 3)} ${size}`;
  }

  getCombinedSize(arrayOfFiles) {
    const fs = require("fs");
    let totalSize = 0;

    arrayOfFiles.forEach(function(filePath) {
      totalSize += fs.statSync(filePath).size;
    });

    return totalSize;
  }
}

function getAllFiles(dirPath, arrayOfFiles, extension) {
  const fs = require("fs");
  //dirPath = dirPath.split('/').filter((s) => s.length).join('/');
  var files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles, extension);
    } else {
      if(!file.endsWith(extension || "") && !fs.statSync(dirPath + "/" + file).isFile()) return;
      if(file.endsWith(".DS_Store")) return;
      arrayOfFiles.push(dirPath + '/' + file);
    }
  });

  return arrayOfFiles;
}
module.exports = StatusCommand;