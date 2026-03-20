require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const general      = require('./commands/general');
const moderation   = require('./commands/moderation');
const music        = require('./commands/music');
const guides       = require('./commands/guides');
const tierlist     = require('./commands/tierlist');
const tickets      = require('./commands/tickets');
const levels       = require('./commands/levels');
const sondage      = require('./commands/sondage');
const giveaway     = require('./commands/giveaway');
const memes        = require('./commands/memes');
const roles        = require('./commands/roles');
const reputation   = require('./commands/reputation');
const quiz         = require('./commands/quiz');
const reglement    = require('./commands/reglement');
const logs         = require('./commands/logs');
const defis        = require('./commands/defis');
const evenements   = require('./commands/evenements');
const warn         = require('./commands/warn');
const autoresponse = require('./commands/autoresponse');
const annonces     = require('./commands/annonces');
const coach        = require('./commands/coach');
const boosts       = require('./commands/boosts');

const PREFIX = '!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── Prêt ───────────────────────────────────────────────────
client.once('clientReady', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('!aide', { type: 2 });
  await giveaway.init(client);

  // Sauvegarde automatique toutes les heures
  setInterval(() => {
    const dataDir = path.join(__dirname, 'data');
    const backupDir = path.join(__dirname, 'data', 'backup');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const fichiers = ['levels.json', 'reputation.json', 'warnings.json', 'giveaways.json'];
    for (const fichier of fichiers) {
      const src = path.join(dataDir, fichier);
      const dest = path.join(backupDir, fichier);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    }
    console.log('💾 Sauvegarde automatique effectuée');
  }, 60 * 60 * 1000);
});

// ─── Message de bienvenue ────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  if (!channelId) return;
  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('👋 Nouveau membre !')
    .setDescription(
      `Bienvenue sur **${member.guild.name}**, ${member} !\n\n` +
      `📜 Lis le règlement pour accéder au serveur\n` +
      `🎭 Choisis ton rang et ta position dans **#🎭-choix-roles**\n` +
      `💬 Présente-toi dans **#💬-général**\n` +
      `❓ Tape \`!aide\` pour voir les commandes`
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `Membre #${member.guild.memberCount}` })
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

// ─── Boost détection ────────────────────────────────────────
client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (!oldMember.premiumSince && newMember.premiumSince) {
    boosts.handleBoost(newMember);
  }
});

// ─── Boutons ────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  await tickets.handleButton(interaction).catch(() => {});
  await roles.handleButton(interaction).catch(() => {});
  await reglement.handleButton(interaction).catch(() => {});
});

// ─── Messages ───────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  levels.addXP(message);

  if (message.author.bot) return;

  // Réponses automatiques
  await autoresponse.handleMessage(message);

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  const commandMap = {
    general:    ['ping', 'aide', 'info', 'setup-chat'],
    moderation: ['kick', 'ban', 'mute', 'clear'],
    music:      ['play', 'skip', 'stop', 'queue', 'volume'],
    guides:     ['setup-guides', 'guide', 'champions'],
    tierlist:   ['tierlist'],
    tickets:    ['setup-tickets', 'fermer'],
    levels:     ['niveau', 'top'],
    sondage:    ['sondage'],
    giveaway:   ['giveaway', 'greroll'],
    memes:      ['meme', 'setup-memes'],
    roles:      ['setup-roles'],
    reputation: ['rep', 'monrep', 'top-rep'],
    quiz:       ['quiz'],
    reglement:  ['setup-reglement'],
    logs:       ['setup-logs'],
    defis:      ['defi', 'setup-defis'],
    evenements: ['setup-evenements', 'soiree', 'lfg'],
    warn:       ['warn', 'warns', 'clearwarns'],
    annonces:   ['setup-annonces', 'annonce'],
    coach:      ['setup-coach', 'coach'],
    boosts:     ['setup-boosts', 'boosts'],
  };

  const handlers = {
    general, moderation, music, guides, tierlist, tickets, levels,
    sondage, giveaway, memes, roles, reputation, quiz, reglement,
    logs, defis, evenements, warn, annonces, coach, boosts,
  };

  try {
    for (const [name, cmds] of Object.entries(commandMap)) {
      if (cmds.includes(command)) {
        await handlers[name].handle(message, args, command, client);
        break;
      }
    }
  } catch (err) {
    console.error(`Erreur commande !${command}:`, err);
    message.reply('❌ Une erreur est survenue.').catch(() => {});
  }
});

client.login(process.env.TOKEN);
