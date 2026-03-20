const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/warnings.json');
function load() { try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch { return {}; } }
function save(data) { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  async handle(message, args, command) {
    const data = load();

    if (command === 'warn') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply('❌ Tu n\'as pas la permission.');
      }

      const target = message.mentions.members.first();
      if (!target) return message.reply('❌ Mentionne un membre : `!warn @joueur [raison]`');
      if (target.user.bot) return message.reply('❌ Impossible de warn un bot.');

      const raison = args.slice(1).join(' ') || 'Aucune raison fournie';

      if (!data[target.id]) data[target.id] = { username: target.user.username, warns: [] };
      data[target.id].username = target.user.username;
      data[target.id].warns.push({ raison, date: new Date().toISOString(), moderateur: message.author.username });
      save(data);

      const nbWarns = data[target.id].warns.length;

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('⚠️ Avertissement')
            .addFields(
              { name: 'Membre', value: `${target}`, inline: true },
              { name: 'Raison', value: raison, inline: true },
              { name: 'Total warns', value: `**${nbWarns}/3**`, inline: true },
            )
            .setFooter({ text: `Par ${message.author.username}` })
            .setTimestamp(),
        ],
      });

      // Prévient le membre en DM
      target.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`⚠️ Tu as reçu un avertissement sur **${message.guild.name}**`)
            .addFields(
              { name: 'Raison', value: raison },
              { name: 'Avertissements', value: `${nbWarns}/3` },
            ),
        ],
      }).catch(() => {});

      // Auto-mute à 3 warns
      if (nbWarns >= 3) {
        await target.timeout(60 * 60 * 1000, '3 avertissements atteints');
        message.channel.send(`🔇 ${target} a été automatiquement mute 1 heure (3 avertissements atteints).`);
      }
    }

    if (command === 'warns') {
      const target = message.mentions.members.first() || message.member;
      const userData = data[target.id];

      if (!userData || userData.warns.length === 0) {
        return message.reply(`✅ **${target.user.username}** n'a aucun avertissement.`);
      }

      const liste = userData.warns.map((w, i) =>
        `**${i + 1}.** ${w.raison} — *par ${w.moderateur} le ${new Date(w.date).toLocaleDateString('fr-FR')}*`
      ).join('\n');

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`⚠️ Avertissements de ${target.user.username}`)
            .setDescription(liste)
            .setFooter({ text: `${userData.warns.length}/3 avertissements` }),
        ],
      });
    }

    if (command === 'clearwarns') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const target = message.mentions.members.first();
      if (!target) return message.reply('❌ Mentionne un membre.');

      if (data[target.id]) {
        data[target.id].warns = [];
        save(data);
      }

      message.reply(`✅ Avertissements de **${target.user.username}** effacés.`);
    }
  },
};
