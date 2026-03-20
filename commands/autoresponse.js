const { EmbedBuilder } = require('discord.js');

// Réponses automatiques aux mots clés
const REPONSES_MOTS = [
  { mots: ['ff', 'ff15', 'ff20'], reponses: ['Non ! On peut encore gagner ! 💪', 'JAMAIS FF ! 🔥', 'Remontada possible ! Keep going !', 'Un vrai joueur ne FF pas ! 😤'] },
  { mots: ['gg', 'gg wp', 'bien joué', 'bj'], reponses: ['GG WP ! 🏆', 'Belle partie ! 🎮', 'GG à toute l\'équipe ! 💪'] },
  { mots: ['noob', 'nul', 'mauvais'], reponses: ['Tout le monde commence quelque part ! 😊', 'Les insultés d\'aujourd\'hui sont les smurfs de demain 👑', 'Sois positif ! 🌟'] },
  { mots: ['penta', 'pentakill'], reponses: ['PENTAKILLLLL 🔥🔥🔥', 'LÉGENDAIRE ! 👑', 'C\'est une bête sauvage ! 😱'] },
  { mots: ['tilt', 'tilté'], reponses: ['Prends une pause ! ☕', 'Respire, bois de l\'eau, reprends ! 😌', 'Une pause s\'impose ! 🧘'] },
  { mots: ['int', 'inter', 'feeder'], reponses: ['Chaque mort est une leçon ! 📚', 'On apprend de ses erreurs ! 💡', 'Next game sera meilleure ! 🎯'] },
];

// Réponses quand le bot est mentionné
const REPONSES_MENTION = [
  'Oui, je suis là ! Tape `!aide` pour voir mes commandes 🤖',
  'À votre service ! Que puis-je faire pour vous ? ⚔️',
  'GLHF ! 🎮',
  'Prêt à dominer la ranked ! 💪',
  'On va carry ensemble ! 🏆',
  'Tu m\'as appelé ? Je farm les camps là 🌿',
];

module.exports = {
  async handleMessage(message) {
    if (message.author.bot) return;

    const contenu = message.content.toLowerCase();

    // Réponse si le bot est mentionné
    if (message.mentions.has(message.client.user)) {
      const rep = REPONSES_MENTION[Math.floor(Math.random() * REPONSES_MENTION.length)];
      return message.reply(rep);
    }

    // Réponses aux mots clés (20% de chance pour ne pas spammer)
    if (Math.random() > 0.2) return;

    for (const { mots, reponses } of REPONSES_MOTS) {
      if (mots.some(m => contenu.includes(m))) {
        const rep = reponses[Math.floor(Math.random() * reponses.length)];
        message.reply(rep);
        break;
      }
    }
  },
};
