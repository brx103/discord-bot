const { EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  async handle(message, args, command, client) {
    if (command === 'setup-tickets') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur** pour utiliser cette commande.');
      }

      const guild = message.guild;

      // Crée la catégorie tickets
      const categorie = await guild.channels.create({
        name: '🎫 TICKETS',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      // Channel pour ouvrir un ticket
      const ticketChannel = await guild.channels.create({
        name: '📩-ouvrir-un-ticket',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
            deny: [PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket')
          .setLabel('📩 Ouvrir un ticket')
          .setStyle(ButtonStyle.Primary)
      );

      await ticketChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎫 Support')
            .setDescription('Clique sur le bouton ci-dessous pour **ouvrir un ticket** et contacter les admins en privé.'),
        ],
        components: [row],
      });

      // Sauvegarde l'ID de catégorie dans un fichier
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, '../data/tickets-config.json');
      fs.writeFileSync(configPath, JSON.stringify({ categoryId: categorie.id }));

      message.reply('✅ Système de tickets créé !');
    }

    if (command === 'fermer') {
      if (!message.channel.name.startsWith('ticket-')) {
        return message.reply('❌ Cette commande ne peut être utilisée que dans un ticket.');
      }
      await message.reply('🔒 Ticket fermé. Ce channel sera supprimé dans 5 secondes.');
      setTimeout(() => message.channel.delete().catch(() => {}), 5000);
    }
  },

  async handleButton(interaction) {
    if (interaction.customId !== 'open_ticket') return;

    const guild = interaction.guild;
    const member = interaction.member;

    // Vérifie si le ticket existe déjà
    const existing = guild.channels.cache.find(c => c.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
    if (existing) {
      return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}`, ephemeral: true });
    }

    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../data/tickets-config.json');
    let categoryId = null;
    if (fs.existsSync(configPath)) {
      categoryId = JSON.parse(fs.readFileSync(configPath)).categoryId;
    }

    const ticketChannel = await guild.channels.create({
      name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: guild.ownerId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    await ticketChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('🎫 Ticket ouvert')
          .setDescription(`Bienvenue ${member} ! Explique ton problème, un admin va te répondre.\n\nTape \`!fermer\` pour fermer ce ticket.`),
      ],
    });

    interaction.reply({ content: `✅ Ton ticket a été créé : ${ticketChannel}`, ephemeral: true });
  },
};
