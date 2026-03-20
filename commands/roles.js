const { EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const RANGS = ['Bronze', 'Silver', 'Gold', 'Platine', 'Diamant', 'Maître', 'Challenger'];
const RANG_EMOJIS = ['🥉', '🥈', '🥇', '💎', '💠', '👑', '🏆'];

const POSITIONS = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];
const POS_EMOJIS = ['🗡️', '🌿', '🔮', '🏹', '🛡️'];

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-roles') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;

      // Crée les rôles de rang s'ils n'existent pas
      for (let i = 0; i < RANGS.length; i++) {
        const existing = guild.roles.cache.find(r => r.name === `${RANG_EMOJIS[i]} ${RANGS[i]}`);
        if (!existing) {
          await guild.roles.create({ name: `${RANG_EMOJIS[i]} ${RANGS[i]}`, mentionable: false });
        }
      }

      // Crée les rôles de position s'ils n'existent pas
      for (let i = 0; i < POSITIONS.length; i++) {
        const existing = guild.roles.cache.find(r => r.name === `${POS_EMOJIS[i]} ${POSITIONS[i]}`);
        if (!existing) {
          await guild.roles.create({ name: `${POS_EMOJIS[i]} ${POSITIONS[i]}`, mentionable: false });
        }
      }

      // Crée le channel choix-roles
      const existing = guild.channels.cache.find(c => c.name === '🎭-choix-roles');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '🎭-choix-roles',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });

      // Message rangs
      const rowRangs1 = new ActionRowBuilder().addComponents(
        ...RANGS.slice(0, 4).map((r, i) =>
          new ButtonBuilder().setCustomId(`rang_${r}`).setLabel(`${RANG_EMOJIS[i]} ${r}`).setStyle(ButtonStyle.Secondary)
        )
      );
      const rowRangs2 = new ActionRowBuilder().addComponents(
        ...RANGS.slice(4).map((r, i) =>
          new ButtonBuilder().setCustomId(`rang_${r}`).setLabel(`${RANG_EMOJIS[i + 4]} ${r}`).setStyle(ButtonStyle.Secondary)
        )
      );

      await channel.send({
        embeds: [new EmbedBuilder().setColor(0xF1C40F).setTitle('🏆 Choisis ton rang LoL').setDescription('Clique sur ton rang actuel pour l\'obtenir.\nClique à nouveau pour le retirer.')],
        components: [rowRangs1, rowRangs2],
      });

      // Message positions
      const rowPos = new ActionRowBuilder().addComponents(
        ...POSITIONS.map((p, i) =>
          new ButtonBuilder().setCustomId(`pos_${p}`).setLabel(`${POS_EMOJIS[i]} ${p}`).setStyle(ButtonStyle.Primary)
        )
      );

      await channel.send({
        embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('🎮 Choisis ta position').setDescription('Clique sur ta position principale.\nClique à nouveau pour la retirer.')],
        components: [rowPos],
      });

      message.reply(`✅ Channel ${channel} créé avec les rôles !`);
    }
  },

  async handleButton(interaction) {
    const id = interaction.customId;
    if (!id.startsWith('rang_') && !id.startsWith('pos_')) return;

    const guild = interaction.guild;
    const member = interaction.member;
    const nom = id.startsWith('rang_') ? id.replace('rang_', '') : id.replace('pos_', '');

    const role = guild.roles.cache.find(r => r.name.includes(nom));
    if (!role) return interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      interaction.reply({ content: `❌ Rôle **${role.name}** retiré.`, ephemeral: true });
    } else {
      // Si rang, retire les autres rangs d'abord
      if (id.startsWith('rang_')) {
        for (const rang of RANGS) {
          const r = guild.roles.cache.find(x => x.name.includes(rang));
          if (r && member.roles.cache.has(r.id)) await member.roles.remove(r).catch(() => {});
        }
      }
      await member.roles.add(role);
      interaction.reply({ content: `✅ Rôle **${role.name}** attribué !`, ephemeral: true });
    }
  },
};
