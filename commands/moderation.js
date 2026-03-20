const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logs = require('./logs');

module.exports = {
  async handle(message, args, command) {
    // Vérification des permissions selon la commande
    const permMap = {
      kick: PermissionFlagsBits.KickMembers,
      ban: PermissionFlagsBits.BanMembers,
      mute: PermissionFlagsBits.ModerateMembers,
      clear: PermissionFlagsBits.ManageMessages,
    };

    if (!message.member.permissions.has(permMap[command])) {
      return message.reply('❌ Tu n\'as pas la permission d\'utiliser cette commande.');
    }

    switch (command) {
      case 'kick': {
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Mentionne un membre à kick.');
        const raison = args.slice(1).join(' ') || 'Aucune raison fournie';
        await target.kick(raison);
        await logs.log(message.client, 'kick', message.author, target.user, raison);
        message.reply(`✅ **${target.user.tag}** a été kick. Raison : ${raison}`);
        break;
      }

      case 'ban': {
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Mentionne un membre à ban.');
        const raison = args.slice(1).join(' ') || 'Aucune raison fournie';
        await target.ban({ reason: raison });
        await logs.log(message.client, 'ban', message.author, target.user, raison);
        message.reply(`✅ **${target.user.tag}** a été banni. Raison : ${raison}`);
        break;
      }

      case 'mute': {
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Mentionne un membre à mute.');
        const minutes = parseInt(args[1]) || 10;
        const ms = minutes * 60 * 1000;
        await target.timeout(ms, `Mute par ${message.author.tag}`);
        await logs.log(message.client, 'mute', message.author, target.user, `${minutes} minute(s)`);
        message.reply(`✅ **${target.user.tag}** est mute pour ${minutes} minute(s).`);
        break;
      }

      case 'clear': {
        const nb = Math.min(parseInt(args[0]) || 10, 100);
        await message.channel.bulkDelete(nb, true);
        const confirm = await message.channel.send(`✅ ${nb} message(s) supprimé(s).`);
        setTimeout(() => confirm.delete().catch(() => {}), 3000);
        break;
      }
    }
  }
};
