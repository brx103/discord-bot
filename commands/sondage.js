const { EmbedBuilder } = require('discord.js');

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
  async handle(message, args, command) {
    if (command === 'sondage') {
      // Parse les arguments entre guillemets
      const matches = message.content.match(/"([^"]+)"/g);
      if (!matches || matches.length < 3) {
        return message.reply('❌ Format : `!sondage "Question" "Option1" "Option2" ...`\nExemple : `!sondage "Meilleur carry ?" "Master Yi" "Jinx" "Zed"`');
      }

      const options = matches.map(m => m.replace(/"/g, ''));
      const question = options.shift();

      if (options.length > 10) return message.reply('❌ Maximum 10 options.');

      const description = options.map((opt, i) => `${EMOJIS[i]} ${opt}`).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setFooter({ text: `Sondage créé par ${message.author.username}` })
        .setTimestamp();

      await message.delete().catch(() => {});
      const poll = await message.channel.send({ embeds: [embed] });

      for (let i = 0; i < options.length; i++) {
        await poll.react(EMOJIS[i]);
      }
    }
  },
};
