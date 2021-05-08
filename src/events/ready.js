const Event = require("../struct/event.js");

class ReadyEvent extends Event {
  constructor() {
    super({
      id: "ready",
      once: true,
    });
    this.status = 0;//here is the status array, so that u can changed the first status will gonna show up.
  }

  do() {
    console.log(this.status)
    console.log(require("chalk").redBright(require("fs").readFileSync(`${__dirname}/.credits`, "utf-8"))); //Credits Plss.. :(

    this.client.shard ? this.shardStatus() : this.noshardStatus();
    let i = 0;
    setInterval(() => {
      if (i > this.client.status.length - 1) i = 0;
      this.status = i;
      this.client.shard ? this.shardStatus() : this.noshardStatus();
      i++;
    }, 15 * 1000);
  }

  noshardStatus(){
    const status = this.client.status;
    this.client.user.setPresence({
      activity: {
        name: status[this.status].name.replace(/\{client\}/gi, this.client.user.username).replace(/\{guilds\}/gi, this.client.guilds.cache.size).replace(/\{users\}/gi, this.client.guilds.cache.reduce((acc, value) => acc + value.memberCount, 0)).replace(/\{channels\}/gi, this.client.channels.cache.size),
        type: status[this.status].type
      }, status : "idle"
    });
  }

  shardStatus() {
    const status = this.client.status;
    try {
      const promises = [
        this.client.shard.fetchClientValues('guilds.cache.size'),
        this.client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)')
      ];
      return Promise.all(promises).then(results => {
        const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
        const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
        for(const shard of this.client.shard.ids)
        this.client.user.setPresence({
          activity: {
            name: `#${shard} Shard | ${status[this.status].name.replace(/\{client\}/gi, this.client.user.username).replace(/\{guilds\}/gi, totalGuilds).replace(/\{users\}/gi, Math.ceil(totalMembers/1000)).replace(/\{channels\}/gi, this.client.channels.cache.size)}`,
            type: status[this.status].type,
            shardID: shard
          }, status : "idle"
        });
      }).catch(console.error);
    } catch(e) {
    this.client.user.setPresence({
      activity: {
        name: status[this.status].name.replace(/\{client\}/gi, this.client.user.username).replace(/\{guilds\}/gi, this.client.guilds.cache.size).replace(/\{users\}/gi, this.client.guilds.cache.reduce((acc, value) => acc + value.memberCount, 0)).replace(/\{channels\}/gi, this.client.channels.cache.size),
        type: status[this.status].type,
        shardID: 0
      }, status : "idle"
    });
    }
  }
}

module.exports = ReadyEvent;