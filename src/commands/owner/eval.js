const Command = require("../../struct/command.js");
const { MessageAttachment } = require("discord.js");
const { inspect, promisify } = require("util");
const { writeFile, readFile } = require("fs");

// eslint-disable-next-line no-unused-vars
const write = promisify(writeFile);
// eslint-disable-next-line no-unused-vars
const read = promisify(readFile);

class EvalCommand extends Command {
  constructor() {
    super({
      id: "eval",
      ratelimit: 5,
      ownerOnly: true
    });
  }

  async do(message, [...code]) {
    // eslint-disable-next-line no-unused-vars
    const client = this.client;

    if (!code.length) return message.channel.send("I need some code to evaluate");
    code = parseCodeblock(code.join(" ").replace(/(^`{3}(\w+)?|`{3}$)/g, ""));
    code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    let evaled;
    try {
      const start = process.hrtime();
      //if(code.includes("await")) evaled = eval(`use strict"; (async () => { ${code} })()`);
      evaled = eval(code);
      const end = process.hrtime(start);
      if (evaled instanceof Promise) evaled = await evaled;

      evaled = this.clean(evaled);
      let output = [`${evaled}`].join("\n");

      if (!(check(output, ["/struct/command.js", "process.env"])) && output.length < 2000) {
        const embed = this.client.BaseEmbed(message);
        embed.setTitle(":outbox_tray: Output:");
        embed.setDescription(`\`\`\`js\n${(inspect(evaled, { depth: 1 })).substring(0, 2000)}\n\`\`\``);
        embed.addField(":inbox_tray: Input", "```js\n" + code.substring(0, 1000) + "```");
        embed.setColor(isError(evaled) ? this.client.color("red") : this.client.color("green"));
        embed.setFooter(`Execution time: ${(((end[0] * 1e9) + end[1]))}ms`);
        await message.channel.send(embed);
      } else {
        if(check(output, ["/struct/command.js"])) output += "\n\n//Author: Nekoyasui#6804 (817238971255488533)\n//Join my server: https://discord.gg/n6EnQcQNxg";
        await message.channel.send(new MessageAttachment(Buffer.from(String(output)), "output.js"));
      }
    } catch (e) {
      return this.client.logs(message, e, "error");
    }
  }

  clean(text) {
    if (typeof text === "string") {
      text = text
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`)
        .replace(new RegExp(this.client.token, "g"), this.client.token.split(".").map((val, i) => (i > 1 ? val = this.client.gen(27) : val)).join("."));
    }
    return text;
  }
}

function isError (object) {
  console.log(object);
  const name = object && object.constructor && object.constructor.name;
  if (!name) return true;
  return /.*Error$/.test(name);
}

function check(script, value) {
  if(Array.isArray(value)) return value.some((str) => script.toLowerCase().includes(str));
  else if(typeof value === "string") script.toLowerCase().includes(value);
  else throw "You can't check an object type.";
}

// eslint-disable-next-line no-unused-vars
async function shell(command = "npm --v") {
  const exec = require("util").promisify(require("child_process").exec);

  const { stdout, stderr } = await exec(command);
  return { stdout : JSON.stringify(stdout).replace(/(\\n)/g, ""), stderr: JSON.stringify(stderr).replace(/(\\n)/g, "") };
}

// Code from: https://github.com/lifeguardbot/lifeguard/blob/a31f57b5164d95d16f0dd961c10a5b77dc9e7bd4/src/plugins/dev/eval.ts#L6-L13
function parseCodeblock(script) {
  const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
  const result = cbr.exec(script);
  if (result) {
    return result[4];
  }
  return script;
}

module.exports = EvalCommand;