const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
function loadConfig() { try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; } }
function saveConfig(data) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-evenements') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;
      const existing = guild.channels.cache.find(c => c.name === '📅-evenements');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '📅-evenements',
        type: ChannelType.GuildText,
        topic: 'Annonces des soirées et événements du serveur',
        permissionOverwrites: [
          { id: guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });

      // Channel LFG
      const lfgExisting = guild.channels.cache.find(c => c.name === '🎮-cherche-equipe');
      if (lfgExisting) await lfgExisting.delete().catch(() => {});

      const lfgChannel = await guild.channels.create({
        name: '🎮-cherche-equipe',
        type: ChannelType.GuildText,
        topic: 'Cherche coéquipiers pour des parties — !lfg pour poster',
      });

      const config = loadConfig();
      config.evenementsChannelId = channel.id;
      config.lfgChannelId = lfgChannel.id;
      saveConfig(config);

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('📅 Bienvenue dans les événements !')
            .setDescription('Les soirées de jeu et tournois seront annoncés ici.\nUtilise `!soiree` pour organiser une soirée de jeu !'),
        ],
      });

      await lfgChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🎮 Cherche équipe LoL')
            .setDescription('Cherche des coéquipiers pour jouer !\nUtilise `!lfg [rang] [position]` pour poster ton annonce.\nExemple : `!lfg Gold Mid`'),
        ],
      });

      message.reply(`✅ Channels créés : ${channel} et ${lfgChannel}`);
    }

    if (command === 'soiree') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const config = loadConfig();
      const channel = message.guild.channels.cache.get(config.evenementsChannelId);
      if (!channel) return message.reply('❌ Fais d\'abord `!setup-evenements`');

      const date = args.join(' ') || 'Ce soir';
      const everyone = message.guild.roles.everyone;

      channel.send({
        content: `${everyone}`,
        embeds: [
          new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('🎮 Soirée League of Legends !')
            .setDescription(`**Quand ?** ${date}\n\nQui est partant ? Réagis avec 🎮 !\nOn va rank et s\'amuser !`)
            .setFooter({ text: `Organisé par ${message.author.username}` })
            .setTimestamp(),
        ],
      }).then(msg => msg.react('🎮'));

      message.reply('✅ Annonce de soirée envoyée !');
    }

    if (command === 'lfg') {
      const config = loadConfig();
      const channel = message.guild.channels.cache.get(config.lfgChannelId);
      if (!channel) return message.reply('❌ Fais d\'abord `!setup-evenements`');

      const infos = args.join(' ') || 'Non précisé';

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🎮 Recherche de coéquipiers')
            .setDescription(`${message.author} cherche des joueurs !\n**Infos :** ${infos}`)
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp(),
        ],
      });

      message.reply('✅ Annonce postée dans le channel cherche-equipe !');
    }
  },
};
