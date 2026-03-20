const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
function loadConfig() { try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; } }
function saveConfig(data) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2)); }

const DEFIS = [
  { titre: 'Le Farmer', description: 'Fais **200 CS** dans une seule partie', recompense: '+500 XP', difficulte: '⭐⭐' },
  { titre: 'Le Carry', description: 'Termine une partie avec **10 kills ou plus**', recompense: '+400 XP', difficulte: '⭐⭐' },
  { titre: 'L\'Intouchable', description: 'Gagne une partie sans mourir', recompense: '+800 XP', difficulte: '⭐⭐⭐⭐' },
  { titre: 'Le Support', description: 'Fais **20 assists** dans une seule partie', recompense: '+350 XP', difficulte: '⭐⭐' },
  { titre: 'Le Dominator', description: 'Détruit **3 tourelles** dans une partie', recompense: '+300 XP', difficulte: '⭐⭐' },
  { titre: 'Le Penta', description: 'Réalise un **Pentakill**', recompense: '+1000 XP', difficulte: '⭐⭐⭐⭐⭐' },
  { titre: 'Le Speedrun', description: 'Gagne une partie en **moins de 25 minutes**', recompense: '+600 XP', difficulte: '⭐⭐⭐' },
  { titre: 'Le Polyvalent', description: 'Joue **3 champions différents** cette semaine', recompense: '+250 XP', difficulte: '⭐' },
];

function getDefiSemaine() {
  const semaine = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return DEFIS[semaine % DEFIS.length];
}

module.exports = {
  async handle(message, args, command) {
    if (command === 'defi') {
      const defi = getDefiSemaine();
      const finSemaine = new Date();
      finSemaine.setDate(finSemaine.getDate() + (7 - finSemaine.getDay()));
      finSemaine.setHours(23, 59, 59);

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`🏆 Défi de la semaine — ${defi.titre}`)
            .setDescription(defi.description)
            .addFields(
              { name: '🎁 Récompense', value: defi.recompense, inline: true },
              { name: '💪 Difficulté', value: defi.difficulte, inline: true },
              { name: '⏱️ Fin', value: `<t:${Math.floor(finSemaine.getTime() / 1000)}:R>`, inline: true },
            )
            .setFooter({ text: 'Prouvez votre victoire avec un screenshot dans le channel dédié !' }),
        ],
      });
    }

    if (command === 'setup-defis') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;
      const existing = guild.channels.cache.find(c => c.name === '🏆-defis-semaine');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '🏆-defis-semaine',
        type: ChannelType.GuildText,
        topic: 'Défis hebdomadaires — !defi pour voir le défi de la semaine',
      });

      const config = loadConfig();
      config.defisChannelId = channel.id;
      saveConfig(config);

      const defi = getDefiSemaine();
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('🏆 Bienvenue dans les défis hebdomadaires !')
            .setDescription('Chaque semaine un nouveau défi LoL !\nTapez `!defi` pour voir le défi actuel.\nPostez vos screenshots ici pour prouver votre victoire !'),
        ],
      });

      // Post le défi actuel
      const finSemaine = new Date();
      finSemaine.setDate(finSemaine.getDate() + (7 - finSemaine.getDay()));

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`🎯 Défi actuel — ${defi.titre}`)
            .setDescription(defi.description)
            .addFields(
              { name: '🎁 Récompense', value: defi.recompense, inline: true },
              { name: '💪 Difficulté', value: defi.difficulte, inline: true },
            ),
        ],
      });

      message.reply(`✅ Channel défis créé : ${channel}`);
    }
  },
};
