const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const TOUS_CHAMPIONS = require('../data/champions');

// Champions avec channels dédiés
const GUIDES = [
  {
    champion: 'Master Yi',
    emoji: '⚔️',
    role: 'Jungle',
    couleur: 0xE74C3C,
    channelName: 'guide-master-yi',
    conseils: [
      '**Farm les camps** avant de gank — vise 65+ CS/10 min',
      '**Gank les lanes pushed** vers toi pour faciliter les kills',
      '**Achète Rage-lame de Kraken** en 1er item',
      '**Q (Alpha Strike)** pour esquiver les CC importants',
      '**Ne gank pas si tu peux clear** plus vite en jungle',
    ],
    recherche: 'Master+Yi+guide+jungle+rank+2025',
  },
  {
    champion: 'Jinx',
    emoji: '💥',
    role: 'Botlane (ADC)',
    couleur: 0x9B59B6,
    channelName: 'guide-jinx',
    conseils: [
      '**Reste en sécurité** en early, tu es faible avant niveau 6',
      '**Joue pour les resets** — un kill = snowball massif',
      '**Rockets (W)** pour harasser de loin en lane',
      '**Mégacanon (R)** pour finir les ennemis loin ou les kills globaux',
      '**Achète Manamune + Kraken** pour monter en puissance',
    ],
    recherche: 'Jinx+guide+ADC+rank+2025',
  },
  {
    champion: 'Yasuo',
    emoji: '🌪️',
    role: 'Mid / Toplane',
    couleur: 0x3498DB,
    channelName: 'guide-yasuo',
    conseils: [
      '**Farm jusqu\'au niveau 6** avant de jouer agressif',
      '**Bouclier passif (Way of Wanderer)** — utilise-le pour trader',
      '**E (Tempête d\'acier)** stack le vent pour des tornades',
      '**Dash sur creeps** pour reposition et esquiver',
      '**Jeu en équipe** : cherche les lancers en l\'air alliés pour R',
    ],
    recherche: 'Yasuo+guide+mid+rank+2025',
  },
  {
    champion: 'Zed',
    emoji: '🥷',
    role: 'Mid',
    couleur: 0x2C3E50,
    channelName: 'guide-zed',
    conseils: [
      '**Farm et harass** avec Q (Boomerang) en early',
      '**Combo R → W → E → Q → AA** pour max dégâts',
      '**Utilise les ombres** pour esquiver les CC et fuir',
      '**Cible les ADC / supports** en teamfight',
      '**Achète Duskblade** en premier item',
    ],
    recherche: 'Zed+guide+mid+rank+2025',
  },
  {
    champion: 'Irelia',
    emoji: '🔱',
    role: 'Top / Mid',
    couleur: 0x1ABC9C,
    channelName: 'guide-irelia',
    conseils: [
      '**Farm avec Q (Lames tranchantes)** pour reset le cooldown sur les minions',
      '**Stack ton passif à 4** avant d\'engager pour avoir le maximum de dégâts',
      '**E (Frappe étourdissante)** : utilise-le pour étourdir et sécuriser tes kills',
      '**R (Vanguard de Ionia)** : utilise-le pour initier ou bloquer les ennemis',
      '**Achète Divine Sunderer** en 1er item pour le sustain et les dégâts',
    ],
    recherche: 'Irelia+guide+top+rank+2025',
  },
  {
    champion: 'Katarina',
    emoji: '🗡️',
    role: 'Mid',
    couleur: 0xC0392B,
    channelName: 'guide-katarina-katastrophe',
    conseils: [
      '**Farm en early** sans prendre de risques — tu es faible avant niveau 6',
      '**Niveau 6 = snowball** : utilise ton ulti sur les ennemis groupés',
      '**Ramasse tes dagues** après chaque combo pour reset le CD de E',
      '**Combo W → E → Q → AA → E** pour max dégâts en burst',
      '**Achète Hextech Rocketbelt** en 1er item pour engager facilement',
    ],
    recherche: 'Katarina+guide+mid+rank+2025',
  },
  {
    champion: 'Thresh',
    emoji: '🪝',
    role: 'Support',
    couleur: 0x27AE60,
    channelName: 'guide-thresh',
    conseils: [
      '**Hook (Q)** : vise en avance sur les ennemis qui bougent',
      '**Lanterne (W)** : place-la pour sauver un allié en danger',
      '**Flay (E)** : interrompt les dashes ennemis',
      '**Porte des damnés (R)** : utilise en teamfight pour bloquer une zone',
      '**Ramasse les âmes** pour stacker de l\'armure gratuitement',
    ],
    recherche: 'Thresh+guide+support+rank+2025',
  },
];

module.exports = {
  async handle(message, args, command) {
    if (command === 'setup-guides') {
      // Vérifie les permissions
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur** pour utiliser cette commande.');
      }

      const guild = message.guild;
      const msg = await message.reply('⏳ Création des channels en cours...');

      try {
        // Crée la catégorie
        const categorie = await guild.channels.create({
          name: '📚 GUIDES LOL — MONTER EN RANK',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
              deny: [PermissionsBitField.Flags.SendMessages],
            },
          ],
        });

        // Crée un channel général de guides
        const channelGeneral = await guild.channels.create({
          name: '📌-comment-utiliser',
          type: ChannelType.GuildText,
          parent: categorie.id,
          topic: 'Comment utiliser les guides pour monter en rank',
        });

        await channelGeneral.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xF1C40F)
              .setTitle('📌 Comment utiliser ces guides ?')
              .setDescription(
                '> Ces channels contiennent des **guides pour monter en rank** sur League of Legends.\n\n' +
                '**Comment ça marche ?**\n' +
                '1. Choisis un champion qui t\'intéresse\n' +
                '2. Va dans le channel correspondant\n' +
                '3. Suis les conseils et regarde les vidéos\n\n' +
                '**Commandes utiles :**\n' +
                '`!guide <champion>` — Affiche les conseils d\'un champion\n' +
                '`!champions` — Liste tous les guides disponibles'
              )
              .setFooter({ text: 'Bonne chance dans la climb ! 🏆' }),
          ],
        });

        // Crée un channel par champion
        for (const guide of GUIDES) {
          const channel = await guild.channels.create({
            name: guide.channelName,
            type: ChannelType.GuildText,
            parent: categorie.id,
            topic: `Guide ${guide.champion} — ${guide.role} | Pour monter en rank`,
          });

          // Message principal
          const conseils = guide.conseils.map((c, i) => `${i + 1}. ${c}`).join('\n');
          const lienRecherche = `https://www.youtube.com/results?search_query=${guide.recherche}`;

          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(guide.couleur)
                .setTitle(`${guide.emoji} Guide ${guide.champion} — ${guide.role}`)
                .setDescription(guide.champion === 'Katarina'
                  ? `Guide dédié à **Katastrophe (Thibault)** 🗡️\nGuide complet pour **monter en rank** avec **${guide.champion}** !`
                  : `Guide complet pour **monter en rank** avec **${guide.champion}** !`)
                .addFields(
                  {
                    name: '✅ Conseils pour climb',
                    value: conseils,
                  },
                  {
                    name: '🎥 Vidéos YouTube',
                    value: `[🔍 Rechercher des guides ${guide.champion} sur YouTube](${lienRecherche})`,
                  }
                )
                .setFooter({ text: `${guide.champion} • League of Legends` })
                .setTimestamp(),
            ],
          });
        }

        await msg.edit(`✅ **${GUIDES.length + 1} channels créés** dans la catégorie 📚 GUIDES LOL !`);
      } catch (err) {
        console.error('Erreur setup-guides:', err);
        msg.edit('❌ Erreur lors de la création des channels : ' + err.message);
      }
    }

    if (command === 'guide') {
      const nom = args.join(' ').toLowerCase();
      if (!nom) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xF1C40F)
              .setTitle('📋 Comment utiliser ?')
              .setDescription('Tape `!guide <champion>`\nExemple : `!guide master yi`, `!guide jinx`, `!guide irelia`\n\nTape `!champions` pour voir tous les champions disponibles.')
              .setFooter({ text: `${TOUS_CHAMPIONS.length} champions disponibles` }),
          ],
        });
      }

      // Cherche dans les guides featured d'abord, puis dans tous les champions
      const guideFeatured = GUIDES.find(g => g.champion.toLowerCase().includes(nom));
      const guideTous = TOUS_CHAMPIONS.find(g => g.champion.toLowerCase().includes(nom));
      const guide = guideFeatured || guideTous;

      if (!guide) {
        return message.reply(`❌ Champion **${args.join(' ')}** introuvable. Tape \`!champions\` pour voir la liste.`);
      }

      const conseils = guide.conseils.map((c, i) => `${i + 1}. ${c}`).join('\n');
      const recherche = guide.recherche || `${guide.champion.replace(/ /g, '+')}+guide+${guide.role.split(' ')[0]}+rank+2025`;
      const lienRecherche = `https://www.youtube.com/results?search_query=${recherche}`;
      const couleur = guide.couleur || 0x5865F2;
      const emoji = guide.emoji || '🎮';

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(couleur)
            .setTitle(`${emoji} ${guide.champion} — ${guide.role}`)
            .setDescription(guide.champion === 'Katarina' ? '🗡️ Guide dédié à **Katastrophe (Thibault)**' : `Guide pour monter en rank avec **${guide.champion}**`)
            .addFields(
              { name: '✅ Conseils', value: conseils },
              { name: '🎥 Vidéos', value: `[Rechercher sur YouTube](${lienRecherche})` }
            )
            .setFooter({ text: 'League of Legends • !guide <champion>' }),
        ],
      });
    }

    if (command === 'champions') {
      const parRole = {};
      for (const c of TOUS_CHAMPIONS) {
        const role = c.role.split(' / ')[0].split(' ')[0];
        if (!parRole[role]) parRole[role] = [];
        parRole[role].push(c.champion);
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📋 Tous les champions (${TOUS_CHAMPIONS.length})`)
        .setFooter({ text: 'Utilise !guide <champion> pour voir les conseils' });

      for (const [role, champions] of Object.entries(parRole)) {
        embed.addFields({ name: role, value: champions.join(', '), inline: false });
      }

      message.reply({ embeds: [embed] });
    }
  },
};
