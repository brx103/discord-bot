const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
function loadConfig() { try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; } }
function saveConfig(data) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-logs') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;

      const existing = guild.channels.cache.find(c => c.name === '📋-logs-moderation');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '📋-logs-moderation',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: guild.ownerId, allow: [PermissionsBitField.Flags.ViewChannel] },
        ],
      });

      const config = loadConfig();
      config.logsChannelId = channel.id;
      saveConfig(config);

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('📋 Logs de modération actifs')
            .setDescription('Tous les kicks, bans et mutes seront enregistrés ici.'),
        ],
      });

      message.reply(`✅ Channel de logs créé : ${channel}`);
    }
  },

  async log(client, type, moderateur, cible, raison) {
    const config = loadConfig();
    if (!config.logsChannelId) return;

    const channel = await client.channels.fetch(config.logsChannelId).catch(() => null);
    if (!channel) return;

    const couleurs = { kick: 0xFF6600, ban: 0xE74C3C, mute: 0xF1C40F, unmute: 0x57F287 };
    const emojis = { kick: '👢', ban: '🔨', mute: '🔇', unmute: '🔊' };

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(couleurs[type] || 0x999999)
          .setTitle(`${emojis[type] || '⚠️'} ${type.toUpperCase()}`)
          .addFields(
            { name: 'Modérateur', value: `${moderateur}`, inline: true },
            { name: 'Membre', value: `${cible}`, inline: true },
            { name: 'Raison', value: raison || 'Aucune raison', inline: false },
          )
          .setTimestamp(),
      ],
    });
  },
};
