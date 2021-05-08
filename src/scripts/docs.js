const fs = require("fs"), pkg = require(`${process.cwd()}/package.json`);

module.exports = async (client) => {
  let docs = `# Command List - ${pkg.name}  \n> Command list generated [here](https://github.com/Nekoyasui/${pkg.name}/blob/sensei/src/scripts/docs.js)\n`;

  const categories = removeDuplicates(client.commands.map((c) => c.category));
  for (const category of categories) {
    docs +=
`\n
### ❯ \`${category ? category.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : "Miscellaneous"}\`
| Name | Description |
| ---- | ----------- |
${client.commands.filter((c) => c.category === category).map((command) =>
  `| [${command.id}](https://github.com/NekoYasui/${pkg.name}/blob/sensei/docs/commands.md#${command.id}) | ${command.description || "No description provided."} |`
).join("\n")}`;

  }

  docs += "\\\n\n# Detailed Command List\n";
  for (const category of categories) {
    docs +=
`\n
## ${category ? category.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : "Miscellaneous"}
${client.commands.filter((c) => c.category === category).map((command) =>
  [`### ${command.id}\nDescription: ${command.description || "No description provided."}`,
    `Usage: ${command.usage ? command.usage : "None"}`,
    `Aliases: ${command.aliases.length ? command.aliases.join(", ") : "None"}`
  ].join("\\\n")
).join(`\n\n`)}`;
  }
  docs += `\n\n\n[Back to top](https://github.com/NekoYasui/${pkg.name}/blob/sensei/docs/commands.md#command-list---${pkg.name})`;

  if (fs.existsSync(`${process.cwd()}/docs/commands.md`)) {
    fs.writeFileSync(`${process.cwd()}/docs/commands.md`, docs.trim());
    client.Log().success("Documentations", "Command list updated");
  } else {
    client.Log().warn("Documentations", `Please create 'commands.md' at ${process.cwd()}/docs`);
  }
};

function removeDuplicates(arr) {
  return [...new Set(arr)];
}