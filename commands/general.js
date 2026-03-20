const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  async handle(message, args, command) {
    switch (command) {
      case 'ping': {
        const msg = await message.reply('Calcul...');
        msg.edit(`Pong! 🏓 Latence: ${msg.createdTimestamp - message.createdTimestamp}ms`);
        break;
      }

      case 'aide': {
        const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('📋 Commandes disponibles')
          .addFields(
            { name: '🔧 Général', value: '`!ping` `!info` `!aide`' },
            { name: '🎵 Musique', value: '`!play [titre/URL]` `!skip` `!stop` `!queue` `!volume [0-100]`' },
            { name: '📚 Guides LOL', value: '`!guide [champion]` `!champions` `!tierlist`' },
            { name: '🎫 Tickets', value: '`!fermer`' },
            { name: '⭐ Niveaux', value: '`!niveau [@joueur]` `!top`' },
            { name: '📊 Sondages', value: '`!sondage "Question" "Option1" "Option2"`' },
            { name: '😂 Mèmes', value: '`!meme`' },
          )
          .setFooter({ text: 'Préfixe : !' });

        if (isAdmin) {
          embed.addFields({
            name: '🔨 Modération (admin)',
            value: '`!kick @user` `!ban @user` `!mute @user [minutes]` `!clear [nombre]`\n`!setup-guides` `!setup-tickets` `!setup-memes` `!setup-chat`\n`!giveaway <durée> <prix>` `!greroll`',
          });
        }

        message.reply({ embeds: [embed] });
        break;
      }

      case 'setup-chat': {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return message.reply('❌ Tu dois être **administrateur** pour utiliser cette commande.');
        }

        const guild = message.guild;

        const categorie = await guild.channels.create({
          name: '💬 CHAT',
          type: ChannelType.GuildCategory,
        });

        const channels = [
          { name: '👋-bienvenue', topic: 'Bienvenue sur le serveur !' },
          { name: '💬-général', topic: 'Chat général — parle de tout et de rien' },
          { name: '🎮-league-of-legends', topic: 'Discussions sur League of Legends' },
          { name: '😂-blagues-memes', topic: 'Partage tes mèmes et blagues ici' },
          { name: '🎵-musique', topic: 'Partage ta musique préférée' },
        ];

        for (const ch of channels) {
          await guild.channels.create({
            name: ch.name,
            type: ChannelType.GuildText,
            parent: categorie.id,
            topic: ch.topic,
          });
        }

        message.reply('✅ Catégorie **💬 CHAT** créée avec 5 channels !');
        break;
      }

      case 'info': {
        const guild = message.guild;
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`ℹ️ ${guild.name}`)
          .setThumbnail(guild.iconURL())
          .addFields(
            { name: 'Membres', value: `${guild.memberCount}`, inline: true },
            { name: 'Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
            { name: 'Propriétaire', value: `<@${guild.ownerId}>`, inline: true }
          );
        message.reply({ embeds: [embed] });
        break;
      }
    }
  }
};
