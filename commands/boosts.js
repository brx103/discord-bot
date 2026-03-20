const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
function loadConfig() { try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; } }
function saveConfig(data) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-boosts') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;
      const existing = guild.channels.cache.find(c => c.name === '💎-boosts-serveur');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '💎-boosts-serveur',
        type: ChannelType.GuildText,
        topic: 'Merci à tous les boosters du serveur ! 💎',
        permissionOverwrites: [
          { id: guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });

      const config = loadConfig();
      config.boostsChannelId = channel.id;
      saveConfig(config);

      await this.postBoosts(guild, channel);

      message.reply(`✅ Channel boosts créé : ${channel}`);
    }

    if (command === 'boosts') {
      const config = loadConfig();
      const channel = message.guild.channels.cache.get(config.boostsChannelId);
      if (!channel) return message.reply('❌ Fais d\'abord `!setup-boosts`');
      await this.postBoosts(message.guild, channel);
      message.reply('✅ Liste des boosts mise à jour !');
    }
  },

  async postBoosts(guild, channel) {
    await guild.members.fetch();

    const boosters = guild.members.cache.filter(m => m.premiumSince);
    const niveau = guild.premiumTier;
    const nbBoosts = guild.premiumSubscriptionCount || 0;

    const niveaux = {
      0: { nom: 'Aucun niveau', emoji: '⚪', prochain: `2 boosts pour niveau 1` },
      1: { nom: 'Niveau 1', emoji: '🟣', prochain: `${7 - nbBoosts} boosts pour niveau 2` },
      2: { nom: 'Niveau 2', emoji: '💜', prochain: `${14 - nbBoosts} boosts pour niveau 3` },
      3: { nom: 'Niveau 3', emoji: '💎', prochain: 'Niveau maximum atteint !' },
    };

    const info = niveaux[niveau] || niveaux[0];

    const embed = new EmbedBuilder()
      .setColor(0xFF73FA)
      .setTitle('💎 Boosts du serveur')
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Niveau actuel', value: `${info.emoji} **${info.nom}**`, inline: true },
        { name: 'Total boosts', value: `**${nbBoosts} boosts**`, inline: true },
        { name: 'Prochain niveau', value: info.prochain, inline: true },
      );

    if (boosters.size > 0) {
      const liste = boosters.map(m =>
        `💎 ${m} — booste depuis <t:${Math.floor(m.premiumSince.getTime() / 1000)}:R>`
      ).join('\n');
      embed.addFields({ name: `🙏 Boosters (${boosters.size})`, value: liste });
    } else {
      embed.addFields({ name: '🙏 Boosters', value: 'Aucun booster pour l\'instant.\nBoostez le serveur pour débloquer des avantages !' });
    }

    embed.setFooter({ text: 'Merci à tous les boosters ! 💎' }).setTimestamp();

    // Supprime les anciens messages
    await channel.bulkDelete(10).catch(() => {});
    await channel.send({ embeds: [embed] });
  },

  async handleBoost(member) {
    const config = loadConfig();
    const channel = member.guild.channels.cache.get(config.boostsChannelId);
    if (!channel) return;

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xFF73FA)
          .setTitle('💎 Nouveau Boost !')
          .setDescription(`${member} vient de booster le serveur ! Merci infiniment ! 🙏\nLe serveur a maintenant **${member.guild.premiumSubscriptionCount} boosts** !`)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp(),
      ],
    });
  },
};
