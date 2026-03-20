const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `Tu es un coach League of Legends Challenger, expert du jeu depuis 10 ans. Tu parles français, tu es direct, motivant et précis. Tu donnes des conseils concrets et actionnables pour aider les joueurs à monter en rank.

Ton style :
- Direct et franc, pas de blabla inutile
- Tu utilises le jargon LoL (gank, wave management, macro, micro, split push, etc.)
- Tu donnes des exemples précis avec des champions
- Tu es motivant mais honnête sur les erreurs
- Tes réponses sont courtes et percutantes (max 300 mots)
- Tu termines souvent par un conseil clé ou une action concrète à faire

Tu connais parfaitement : tous les champions, les métas, le jungling, le laning, la macro, les itemisations, les rôles, les matchups.`;

module.exports = {
  async handle(message, args, command, client) {
    if (command === 'setup-coach') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('❌ Tu dois être **administrateur**.');
      }

      const guild = message.guild;
      const existing = guild.channels.cache.find(c => c.name === '🤖-coach-ia');
      if (existing) await existing.delete().catch(() => {});

      const channel = await guild.channels.create({
        name: '🤖-coach-ia',
        type: ChannelType.GuildText,
        topic: 'Pose tes questions à notre coach IA Challenger — !coach <question>',
      });

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('🤖 Coach IA Challenger')
            .setDescription(
              'Bienvenue ! Je suis votre **coach IA Challenger** de League of Legends.\n\n' +
              '**Comment utiliser :**\n' +
              '`!coach <ta question>`\n\n' +
              '**Exemples :**\n' +
              '`!coach comment jouer Master Yi jungle ?`\n' +
              '`!coach comment gérer une wave en top lane ?`\n' +
              '`!coach quel item acheter en 1er sur Jinx ?`\n' +
              '`!coach comment sortir d\'ELO hell ?`'
            )
            .setFooter({ text: 'Coach IA • Powered by Claude AI' }),
        ],
      });

      message.reply(`✅ Channel coach IA créé : ${channel}`);
    }

    if (command === 'coach') {
      const question = args.join(' ');
      if (!question) {
        return message.reply('❌ Pose une question ! Exemple : `!coach comment jouer Master Yi ?`');
      }

      if (!process.env.GROQ_API_KEY) {
        return message.reply('❌ Clé API Groq manquante. Ajoute `GROQ_API_KEY=ta-clé` dans le fichier `.env`');
      }

      const thinking = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x9B59B6)
            .setDescription('⏳ Le coach analyse ta question...'),
        ],
      });

      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 400,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question },
          ],
        });

        const reponse = response.choices[0].message.content.slice(0, 1000);
        const questionCourt = question.slice(0, 200);

        await thinking.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(0x9B59B6)
              .setTitle('🏆 Coach IA Challenger')
              .setDescription(`**❓ Question**\n${questionCourt}\n\n**💡 Réponse**\n${reponse}`)
              .setFooter({ text: `Demandé par ${message.author.username}` })
              .setTimestamp(),
          ],
        });
      } catch (err) {
        console.error('Erreur coach IA complète:', JSON.stringify(err, null, 2));
        thinking.edit(`❌ Erreur : ${JSON.stringify(err?.error || err?.message || err)}`);
      }
    }
  },
};
