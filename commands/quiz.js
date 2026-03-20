const { EmbedBuilder } = require('discord.js');

const QUESTIONS = [
  { q: 'Quel champion utilise des dagues qu\'il ramasse pour reset ses cooldowns ?', r: 'katarina', indices: ['Katarina', 'Zed', 'Akali', 'Talon'] },
  { q: 'Quel est le premier item recommandé pour Master Yi jungle ?', r: 'rage-lame de kraken', indices: ['Rage-lame de Kraken', 'Lame du roi déchu', 'Triforce', 'Danse de la mort'] },
  { q: 'Quel champion lance un crochet pour attraper ses ennemis ?', r: 'thresh', indices: ['Thresh', 'Blitzcrank', 'Nautilus', 'Pyke'] },
  { q: 'Comment s\'appelle l\'ultime de Jinx ?', r: 'mégacanon', indices: ['Mégacanon', 'Super Méga Lance-Roquettes', 'Bombe à fragmentation', 'Tirs en rafale'] },
  { q: 'Quel rôle joue Yasuo principalement ?', r: 'mid', indices: ['Mid', 'Jungle', 'Support', 'Top'] },
  { q: 'Combien de sorts peut utiliser Zed avec ses ombres ?', r: '3', indices: ['3', '2', '4', '1'] },
  { q: 'Quel item donne un bouclier qui absorbe des dégâts et se régénère ?', r: 'sterak', indices: ['Sterak', 'Sunfire', 'Warmog', 'Randuins'] },
  { q: 'Quel champion peut ressusciter après sa mort avec son passif ?', r: 'aatrox', indices: ['Aatrox', 'Zilean', 'Sion', 'Tryndamere'] },
  { q: 'Combien de joueurs composent une équipe dans une partie normale ?', r: '5', indices: ['5', '3', '4', '6'] },
  { q: 'Quel objectif donne un buff rouge en jungle ?', r: 'brambleback', indices: ['Brambleback', 'Gromp', 'Krugs', 'Murkwolves'] },
  { q: 'Quel champion peut devenir invisible avec son ultime et courir vite ?', r: 'master yi', indices: ['Master Yi', 'Twitch', 'Evelynn', 'Shaco'] },
  { q: 'Comment s\'appelle la tour centrale que vous devez détruire pour gagner ?', r: 'nexus', indices: ['Nexus', 'Inhibiteur', 'Tourelle', 'Base'] },
];

const partiesEnCours = new Map();

module.exports = {
  async handle(message, args, command) {
    if (command === 'quiz') {
      const channelId = message.channel.id;
      if (partiesEnCours.has(channelId)) {
        return message.reply('❌ Un quiz est déjà en cours dans ce channel ! Répondez d\'abord à la question.');
      }

      const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      partiesEnCours.set(channelId, question);

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle('🧠 Quiz League of Legends !')
        .setDescription(`**${question.q}**\n\nTapez votre réponse dans le chat !\n⏱️ Vous avez **30 secondes**`)
        .setFooter({ text: 'Quiz LoL' });

      await message.reply({ embeds: [embed] });

      // Collecte les réponses
      const filter = m => !m.author.bot;
      const collector = message.channel.createMessageCollector({ filter, time: 30000 });

      collector.on('collect', async (m) => {
        const reponse = m.content.toLowerCase().trim();
        const bonne = question.r.toLowerCase();

        if (reponse.includes(bonne) || bonne.includes(reponse)) {
          collector.stop('gagne');
          partiesEnCours.delete(channelId);

          // Donne de l'XP bonus
          const levels = require('./levels');
          levels.addXP(m);

          m.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Bonne réponse !')
                .setDescription(`${m.author} a trouvé ! La réponse était **${question.r}** 🎉\n+XP bonus !`),
            ],
          });
        }
      });

      collector.on('end', (_, reason) => {
        if (reason !== 'gagne') {
          partiesEnCours.delete(channelId);
          message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xE74C3C)
                .setTitle('⏱️ Temps écoulé !')
                .setDescription(`Personne n\'a trouvé ! La réponse était **${question.r}**`),
            ],
          });
        }
      });
    }
  },
};
