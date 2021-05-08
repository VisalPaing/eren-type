const config = {
  debug : false,
  prefix: "!!",
  bot: {
    token : "ODMyNDg3MDI3OTcwMjc3Mzg2.YHkf9g.oz50QCmRUSKnzqLPWqNoV_fY64E"
  },
  owners: [
    "817238971255488533"
  ],
  status: [
    {
      type: "COMPETING",
      name: "!help | !!help"
    },{
      type: "WATCHING",
      name: "{guilds} servers with {users} users!"
    }
  ],
  erela: {
    nodes: [{
      identifier: "NODE-MAIN",
      host: "lavalink-repl.xdhhteubanjsfum.repl.co",
      port: 443,
      secure: true,
      password: "youshallnotpass",
    }],
    plugin: {
      enable: false,
      spotify: {
        clientID: "238da9c6373742b0871522f7620ae2d7",
        secret: "3049421c35d54985a26cda537910e0ff"
      }
    }
  }
};

module.exports = config;