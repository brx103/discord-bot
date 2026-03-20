const { EmbedBuilder } = require('discord.js');
const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { reject(new Error('JSON invalide')); }
      });
    }).on('error', reject);
  });
}

const TIERS = {
  'IRON': '🔩 Fer',
  'BRONZE': '🥉 Bronze',
  'SILVER': '🥈 Argent',
  'GOLD': '🥇 Or',
  'PLATINUM': '💚 Platine',
  'EMERALD': '💎 Émeraude',
  'DIAMOND': '💠 Diamant',
  'MASTER': '👑 Maître',
  'GRANDMASTER': '🏆 Grand Maître',
  'CHALLENGER': '⚡ Challenger',
};

module.exports = {
  async handle(message, args, command) {
    if (command === 'stats') {
      const pseudo = args.join(' ');
      if (!pseudo) return message.reply('❌ Format : `!stats Pseudo#TAG`\nExemple : `!stats Faker#KR1`');

      const apiKey = process.env.RIOT_API_KEY;
      if (!apiKey) return message.reply('❌ Clé API Riot manquante.');

      const thinking = await message.reply('⏳ Recherche du joueur...');

      try {
        // Parse le pseudo et le tag
        let gameName, tagLine;
        if (pseudo.includes('#')) {
          [gameName, tagLine] = pseudo.split('#');
        } else {
          gameName = pseudo;
          tagLine = 'EUW';
        }

        gameName = encodeURIComponent(gameName);
        tagLine = encodeURIComponent(tagLine);

        // Récupère le PUUID
        const accountRes = await fetchJSON(
          `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`
        );

        if (accountRes.status === 404) return thinking.edit('❌ Joueur introuvable. Vérifie le pseudo et le tag. Ex: `!stats Pseudo#EUW`');
        if (accountRes.status !== 200) return thinking.edit(`❌ Erreur API : ${accountRes.status}`);

        const puuid = accountRes.data.puuid;

        // Récupère le summoner
        const summonerRes = await fetchJSON(
          `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`
        );

        if (summonerRes.status !== 200) return thinking.edit('❌ Joueur introuvable sur EUW.');

        const summoner = summonerRes.data;

        // Récupère le rang
        const rankRes = await fetchJSON(
          `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}?api_key=${apiKey}`
        );

        const embed = new EmbedBuilder()
          .setColor(0xF1C40F)
          .setTitle(`📊 Stats de ${accountRes.data.gameName}#${accountRes.data.tagLine}`)
          .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`)
          .addFields({ name: '🏆 Niveau', value: `**${summoner.summonerLevel}**`, inline: true });

        if (rankRes.status === 200 && rankRes.data.length > 0) {
          for (const entry of rankRes.data) {
            if (entry.queueType === 'RANKED_SOLO_5x5') {
              const tier = TIERS[entry.tier] || entry.tier;
              const winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
              embed.addFields(
                { name: '⚔️ Solo/Duo', value: `**${tier} ${entry.rank}**\n${entry.leaguePoints} LP`, inline: true },
                { name: '📈 Winrate', value: `**${winrate}%**\n${entry.wins}V ${entry.losses}D`, inline: true },
              );
            }
            if (entry.queueType === 'RANKED_FLEX_SR') {
              const tier = TIERS[entry.tier] || entry.tier;
              const winrate = Math.round((entry.wins / (entry.wins + entry.losses)) * 100);
              embed.addFields({ name: '👥 Flex', value: `**${tier} ${entry.rank}** — ${entry.leaguePoints} LP — WR: ${winrate}%`, inline: false });
            }
          }
          // Si aucune ranked trouvée
          if (!rankRes.data.some(e => e.queueType === 'RANKED_SOLO_5x5')) {
            embed.addFields({ name: '⚔️ Solo/Duo', value: 'Non classé cette saison', inline: true });
          }
        } else {
          embed.addFields({ name: '⚔️ Rang', value: `Non classé (${rankRes.status})`, inline: true });
        }

        embed.setFooter({ text: 'League of Legends • EUW' }).setTimestamp();
        thinking.edit({ content: '', embeds: [embed] });

      } catch (err) {
        console.error('Erreur stats:', err);
        thinking.edit('❌ Erreur lors de la récupération des stats.');
      }
    }
  },
};
