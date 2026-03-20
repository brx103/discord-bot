const { EmbedBuilder } = require('discord.js');

const TIERLIST = {
  'S+': { champions: ['Ambessa', 'Mel', 'Jinx', 'Caitlyn'], couleur: 0xFF0000 },
  'S':  { champions: ['Master Yi', 'Zed', 'Yasuo', 'Yone', 'Thresh', 'Nautilus'], couleur: 0xFF6600 },
  'A':  { champions: ['Ahri', 'Lux', 'Blitzcrank', 'Vi', 'Graves', 'Ezreal'], couleur: 0xFFAA00 },
  'B':  { champions: ['Ashe', 'Garen', 'Malphite', 'Annie', 'Warwick'], couleur: 0xFFFF00 },
  'C':  { champions: ['Teemo', 'Ryze', 'Kalista', 'Azir'], couleur: 0x999999 },
};

module.exports = {
  async handle(message, args, command) {
    if (command === 'tierlist') {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🏆 Tierlist League of Legends — Patch actuel')
        .setDescription('Classement des meilleurs champions pour **monter en rank**')
        .setFooter({ text: 'Mise à jour manuelle • !tierlist' })
        .setTimestamp();

      for (const [tier, data] of Object.entries(TIERLIST)) {
        embed.addFields({
          name: `Tier ${tier}`,
          value: data.champions.join(', '),
          inline: false,
        });
      }

      message.reply({ embeds: [embed] });
    }
  },
};
