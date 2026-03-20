const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
function loadConfig() { try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; } }
function saveConfig(data) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-annonces') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;
      const existing = guild.channels.cache.find(c => c.name === '📢-annonces');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '📢-annonces',
        type: ChannelType.GuildText,
        topic: 'Annonces officielles du serveur',
        permissionOverwrites: [
          { id: guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });

      const config = loadConfig();
      config.annoncesChannelId = channel.id;
      saveConfig(config);

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('📢 Bienvenue dans les annonces !')
            .setDescription('Toutes les annonces importantes du serveur seront postées ici.\nActive les notifications pour ne rien manquer ! 🔔')
            .setTimestamp(),
        ],
      });

      message.reply(`✅ Channel annonces créé : ${channel}`);
    }

    if (command === 'annonce') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const config = loadConfig();
      const channel = message.guild.channels.cache.get(config.annoncesChannelId);
      if (!channel) return message.reply('❌ Fais d\'abord `!setup-annonces`');

      const texte = args.join(' ');
      if (!texte) return message.reply('❌ Format : `!annonce [texte]`');

      const everyone = message.guild.roles.everyone;

      await channel.send({
        content: `${everyone}`,
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('📢 Annonce')
            .setDescription(texte)
            .setFooter({ text: `Par ${message.author.username}` })
            .setTimestamp(),
        ],
      });

      await message.delete().catch(() => {});
      message.channel.send('✅ Annonce envoyée !').then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }
  },
};
