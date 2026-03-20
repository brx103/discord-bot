const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/giveaways.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch { return []; }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function parseDuree(str) {
  const match = str.match(/^(\d+)(s|m|h|j)$/);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unite = match[2];
  if (unite === 's') return val * 1000;
  if (unite === 'm') return val * 60 * 1000;
  if (unite === 'h') return val * 3600 * 1000;
  if (unite === 'j') return val * 86400 * 1000;
  return null;
}

function formatDuree(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} secondes`;
  if (s < 3600) return `${Math.floor(s / 60)} minutes`;
  if (s < 86400) return `${Math.floor(s / 3600)} heures`;
  return `${Math.floor(s / 86400)} jours`;
}

async function terminerGiveaway(client, giveaway) {
  try {
    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return;
    const msg = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!msg) return;

    const reaction = msg.reactions.cache.get('🎉');
    if (!reaction) {
      return channel.send('❌ Personne n\'a participé au giveaway.');
    }

    const users = await reaction.users.fetch();
    const participants = users.filter(u => !u.bot);

    if (participants.size === 0) {
      return channel.send('😢 Personne n\'a participé au giveaway. Pas de gagnant.');
    }

    const gagnant = participants.random();

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('🎉 GIVEAWAY TERMINÉ !')
      .setDescription(`**Prix :** ${giveaway.prix}\n**Gagnant :** ${gagnant}\n\nFélicitations ! 🏆`)
      .setTimestamp();

    await msg.edit({ embeds: [embed] });
    channel.send(`🎉 Félicitations ${gagnant} ! Tu as gagné **${giveaway.prix}** !`);
  } catch (err) {
    console.error('Erreur giveaway:', err);
  }
}

module.exports = {
  // Vérifie les giveaways en cours au démarrage
  async init(client) {
    const data = loadData();
    const now = Date.now();
    const actifs = [];

    for (const g of data) {
      if (g.finAt <= now) {
        await terminerGiveaway(client, g);
      } else {
        actifs.push(g);
        setTimeout(() => terminerGiveaway(client, g), g.finAt - now);
      }
    }

    saveData(actifs);
  },

  async handle(message, args, command, client) {
    if (command === 'giveaway') {
      if (!message.member.permissions.has(8n)) {
        return message.reply('❌ Tu dois être **administrateur** pour lancer un giveaway.');
      }

      if (args.length < 2) {
        return message.reply('❌ Format : `!giveaway <durée> <prix>`\nExemples : `!giveaway 24h "Skin LoL"` | `!giveaway 30m "100 RP"`\nDurée : `s` secondes, `m` minutes, `h` heures, `j` jours');
      }

      const dureeMs = parseDuree(args[0]);
      if (!dureeMs) return message.reply('❌ Durée invalide. Exemples : `30m`, `24h`, `7j`');

      const prix = args.slice(1).join(' ').replace(/"/g, '');
      const finAt = Date.now() + dureeMs;

      const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle('🎉 GIVEAWAY !')
        .setDescription(`**Prix :** ${prix}\n**Durée :** ${formatDuree(dureeMs)}\n**Fin :** <t:${Math.floor(finAt / 1000)}:R>\n\nRéagis avec 🎉 pour participer !`)
        .setFooter({ text: `Lancé par ${message.author.username}` })
        .setTimestamp();

      await message.delete().catch(() => {});
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react('🎉');

      const giveaway = {
        messageId: msg.id,
        channelId: message.channel.id,
        prix,
        finAt,
      };

      const data = loadData();
      data.push(giveaway);
      saveData(data);

      setTimeout(() => terminerGiveaway(client, giveaway), dureeMs);
    }

    if (command === 'greroll') {
      const ref = message.reference;
      if (!ref) return message.reply('❌ Réponds au message du giveaway avec `!greroll`');

      const msg = await message.channel.messages.fetch(ref.messageId).catch(() => null);
      if (!msg) return message.reply('❌ Message introuvable.');

      const reaction = msg.reactions.cache.get('🎉');
      if (!reaction) return message.reply('❌ Aucune participation trouvée.');

      const users = await reaction.users.fetch();
      const participants = users.filter(u => !u.bot);
      if (participants.size === 0) return message.reply('❌ Aucun participant.');

      const gagnant = participants.random();
      message.reply(`🎉 Nouveau gagnant : ${gagnant} !`);
    }
  },
};
