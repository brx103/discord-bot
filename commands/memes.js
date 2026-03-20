const { EmbedBuilder } = require('discord.js');

const MEMES = [
  { texte: 'Quand tu TP sur une wave et que ton carry meurt pendant 3 secondes...', emoji: '😭' },
  { texte: 'Moi : "Je vais juste jouer une partie"\n2h plus tard : "Ok encore une"', emoji: '🕐' },
  { texte: 'Quand tu gank une lane et que le carry recule au lieu d\'attaquer...', emoji: '🤦' },
  { texte: 'Quand tu es Gold et que tu blames tes teammates comme si t\'étais Challenger', emoji: '🏆' },
  { texte: 'Le support qui prend tous les kills "accidentellement"', emoji: '😤' },
  { texte: 'Quand tu achètes le mauvais item et que tu t\'en rends compte à la 40e minute', emoji: '💸' },
  { texte: 'Quand le Teemo adverse est 0/0 et que tout le monde panique quand même', emoji: '🍄' },
  { texte: '"GG FF" alors qu\'il reste 40 minutes de jeu...', emoji: '🚩' },
  { texte: 'Quand ton jungle ne gank pas ta lane depuis 20 minutes', emoji: '🌿' },
  { texte: 'Le Yi qui arrive dans une teamfight à 1 HP et qui quadrakill tout le monde', emoji: '⚔️' },
  { texte: 'Quand tu fais un perfect combo et que l\'ennemi a 1 HP de vie', emoji: '😤' },
  { texte: 'Perdre à cause d\'un DC au moment le plus important du jeu...', emoji: '📶' },
  { texte: 'Quand tu mets "?" et que l\'équipe pense que c\'est toi le problème', emoji: '❓' },
  { texte: 'Jouer à 3h du matin : "Je vais gagner ce jeu ou je dors pas"', emoji: '😴' },
  { texte: 'Quand ton ADC engage avec Jinx ultimate en pleine base ennemie...', emoji: '💥' },
];

module.exports = {
  async handle(message, args, command) {
    if (command === 'meme') {
      const meme = MEMES[Math.floor(Math.random() * MEMES.length)];

      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle(`${meme.emoji} Mème LoL`)
        .setDescription(`*${meme.texte}*`)
        .setFooter({ text: '!meme pour un autre mème' });

      message.reply({ embeds: [embed] });
    }

    if (command === 'setup-memes') {
      if (!message.member.permissions.has(8n)) {
        return message.reply('❌ Tu dois être **administrateur** pour utiliser cette commande.');
      }

      const { ChannelType, PermissionsBitField } = require('discord.js');
      const channel = await message.guild.channels.create({
        name: '😂-memes-lol',
        type: ChannelType.GuildText,
        topic: 'Mèmes League of Legends — !meme pour en avoir un',
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('😂 Bienvenue dans le channel mèmes !')
            .setDescription('Tape `!meme` pour recevoir un mème LoL aléatoire !\nPartage aussi tes propres mèmes ici !'),
        ],
      });

      message.reply(`✅ Channel mèmes créé : ${channel}`);
    }
  },
};
