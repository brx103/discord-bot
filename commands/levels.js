const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/levels.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch { return {}; }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function xpPourNiveau(niveau) {
  return niveau * niveau * 100;
}

const cooldowns = new Map();

module.exports = {
  // Appelé à chaque message pour donner de l'XP
  addXP(message) {
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < 30000) return;
    cooldowns.set(userId, now);

    const data = loadData();
    if (!data[userId]) data[userId] = { xp: 0, niveau: 1, username: message.author.username };

    data[userId].username = message.author.username;
    const xpGagne = Math.floor(Math.random() * 15) + 10;
    data[userId].xp += xpGagne;

    // Vérif level up
    const niveauActuel = data[userId].niveau;
    const xpNecessaire = xpPourNiveau(niveauActuel + 1);
    if (data[userId].xp >= xpNecessaire) {
      data[userId].niveau += 1;
      data[userId].xp = 0;
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('🎉 Level UP !')
            .setDescription(`Félicitations ${message.author} ! Tu es maintenant **niveau ${data[userId].niveau}** !`)
            .setThumbnail(message.author.displayAvatarURL()),
        ],
      });
    }

    saveData(data);
  },

  async handle(message, args, command) {
    const data = loadData();

    if (command === 'niveau') {
      const target = message.mentions.users.first() || message.author;
      const userData = data[target.id];

      if (!userData) {
        return message.reply(`${target.username} n'a pas encore de niveau. Il faut envoyer des messages !`);
      }

      const xpNecessaire = xpPourNiveau(userData.niveau + 1);
      const progression = Math.floor((userData.xp / xpNecessaire) * 20);
      const barre = '█'.repeat(progression) + '░'.repeat(20 - progression);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊 Niveau de ${target.username}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Niveau', value: `**${userData.niveau}**`, inline: true },
          { name: 'XP', value: `${userData.xp} / ${xpNecessaire}`, inline: true },
          { name: 'Progression', value: `\`${barre}\``, inline: false }
        );

      message.reply({ embeds: [embed] });
    }

    if (command === 'top') {
      const sorted = Object.entries(data)
        .sort((a, b) => b[1].niveau - a[1].niveau || b[1].xp - a[1].xp)
        .slice(0, 10);

      if (sorted.length === 0) return message.reply('Aucun joueur dans le classement pour l\'instant.');

      const medals = ['🥇', '🥈', '🥉'];
      const classement = sorted.map(([id, u], i) =>
        `${medals[i] || `**${i + 1}.**`} <@${id}> — Niveau **${u.niveau}**`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle('🏆 Top 10 — Classement du serveur')
        .setDescription(classement)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }
  },
};
