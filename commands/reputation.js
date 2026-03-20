const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/reputation.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch { return {}; }
}
function save(data) { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); }

const cooldowns = new Map();

module.exports = {
  async handle(message, args, command) {
    const data = load();

    if (command === 'rep') {
      const target = message.mentions.users.first();
      if (!target) return message.reply('❌ Mentionne un joueur : `!rep @joueur`');
      if (target.id === message.author.id) return message.reply('❌ Tu ne peux pas te donner de la réputation à toi-même !');
      if (target.bot) return message.reply('❌ Les bots ne comptent pas !');

      const key = `${message.author.id}-${target.id}`;
      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000; // 24h

      if (cooldowns.has(key) && now - cooldowns.get(key) < cooldown) {
        const restant = Math.ceil((cooldown - (now - cooldowns.get(key))) / 3600000);
        return message.reply(`❌ Tu as déjà donné de la réputation à ${target.username} ! Réessaie dans **${restant}h**.`);
      }

      cooldowns.set(key, now);
      if (!data[target.id]) data[target.id] = { rep: 0, username: target.username };
      data[target.id].username = target.username;
      data[target.id].rep += 1;
      save(data);

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('⭐ Réputation donnée !')
            .setDescription(`${message.author} a donné +1 réputation à ${target} !\nIl a maintenant **${data[target.id].rep} ⭐**`)
        ],
      });
    }

    if (command === 'monrep') {
      const target = message.mentions.users.first() || message.author;
      const userData = data[target.id];
      const rep = userData ? userData.rep : 0;

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`⭐ Réputation de ${target.username}`)
            .setDescription(`**${rep} ⭐** réputation`)
            .setThumbnail(target.displayAvatarURL()),
        ],
      });
    }

    if (command === 'top-rep') {
      const sorted = Object.entries(data)
        .sort((a, b) => b[1].rep - a[1].rep)
        .slice(0, 10);

      if (sorted.length === 0) return message.reply('Aucune réputation pour l\'instant.');

      const medals = ['🥇', '🥈', '🥉'];
      const classement = sorted.map(([id, u], i) =>
        `${medals[i] || `**${i + 1}.**`} <@${id}> — **${u.rep} ⭐**`
      ).join('\n');

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('🏆 Top Réputation')
            .setDescription(classement),
        ],
      });
    }
  },
};
