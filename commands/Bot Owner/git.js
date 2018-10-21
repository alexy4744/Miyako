const childProcess = require("child_process");
const { promisify } = require("util");
const exec = promisify(childProcess.exec);
const Command = require("../../modules/Command");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: true,
      botOwnerOnly: true,
      nsfw: false,
      cooldown: 5,
      description: () => `Execute Git commands`,
      usage: () => [`git push Update files and stuff`, `git pull`],
      aliases: [],
      subcommands: ["push", "pull"],
      userPermissions: [],
      botPermissions: [],
      runIn: []
    });
  }

  async pull(msg, args) {
    const branch = args[0] ? args.join(" ") : null;

    try {
      const pull = await exec(`git pull origin ${branch || "master"}`);
      return msg.channel.send(`I have successfully pulled from the repository!\n\n\`\`\`bash\n${pull.stdout}\n\`\`\``);
    } catch (error) {
      return msg.error(error);
    }
  }

  async push(msg, args) {
    if (!args[0]) return msg.fail("Must enter a commit message!");

    const commitMessage = args.join(" ");
    const message = await msg.channel.send(`\`\`\`bash\nAdding all unstaged files...\n\`\`\``);

    try {
      await exec("git add .");
      const commit = await exec(`git commit -m "${commitMessage}"`);
      await message.edit(`\`\`\`bash\nCommit message has been set to "${commitMessage}"\n\n${commit.stdout}\`\`\``);
      await exec(`git push`);
      await message.edit(`\`\`\`bash\n"I have sucessfully pushed the commit to the repository!"\n\n${commit.stdout}\n\`\`\``);
    } catch (error) {
      return message.edit(`\`\`\`bash\n${error}\n\`\`\``);
    }
  }
};
