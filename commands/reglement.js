const { EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');
function loadConfig() { try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; } }
function saveConfig(data) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-reglement') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;

      // Crée le rôle Membre s'il n'existe pas
      let roleMembre = guild.roles.cache.find(r => r.name === '✅ Membre');
      if (!roleMembre) {
        roleMembre = await guild.roles.create({ name: '✅ Membre', mentionable: false, color: 0x57F287 });
      }

      // Sauvegarde l'ID du rôle
      const config = loadConfig();
      config.membreRoleId = roleMembre.id;
      saveConfig(config);

      // Crée le channel règlement
      const existing = guild.channels.cache.find(c => c.name === '📜-reglement');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '📜-reglement',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('accepter_reglement')
          .setLabel('✅ J\'accepte le règlement')
          .setStyle(ButtonStyle.Success)
      );

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📜 Règlement du serveur')
            .setDescription(
              '**1.** Soyez respectueux envers tous les membres\n' +
              '**2.** Pas de spam, publicité ou contenu inapproprié\n' +
              '**3.** Parlez français dans les channels généraux\n' +
              '**4.** Pas de triche, hacks ou comportements toxiques\n' +
              '**5.** Suivez les instructions des modérateurs\n' +
              '**6.** Amusez-vous bien et bonne climb ! 🏆\n\n' +
              '*En cliquant sur le bouton, vous acceptez ce règlement et accédez au serveur.*'
            ),
        ],
        components: [row],
      });

      message.reply(`✅ Channel règlement créé ! Les nouveaux membres devront accepter pour accéder au serveur.`);
    }
  },

  async handleButton(interaction) {
    if (interaction.customId !== 'accepter_reglement') return;

    const config = loadConfig();
    const role = interaction.guild.roles.cache.get(config.membreRoleId);

    if (!role) return interaction.reply({ content: '❌ Rôle introuvable. Contactez un admin.', ephemeral: true });

    if (interaction.member.roles.cache.has(role.id)) {
      return interaction.reply({ content: '✅ Tu as déjà accepté le règlement !', ephemeral: true });
    }

    await interaction.member.roles.add(role);
    interaction.reply({ content: '✅ Bienvenue ! Tu as accepté le règlement et accès au serveur.', ephemeral: true });
  },
};
