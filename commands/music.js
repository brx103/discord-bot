const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  getVoiceConnection,
} = require('@discordjs/voice');
const play = require('play-dl');

// File d'attente par serveur: guildId -> { queue: [], player, connection, volume }
const servers = new Map();

function getServer(guildId) {
  if (!servers.has(guildId)) {
    servers.set(guildId, { queue: [], player: null, connection: null, volume: 0.5 });
  }
  return servers.get(guildId);
}

async function playNext(guildId, textChannel) {
  const server = getServer(guildId);
  if (server.queue.length === 0) {
    textChannel.send('✅ File d\'attente terminée. À bientôt !');
    server.connection?.destroy();
    servers.delete(guildId);
    return;
  }

  const track = server.queue.shift();
  const stream = await play.stream(track.url);
  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  resource.volume.setVolume(server.volume);

  server.player.play(resource);
  textChannel.send(`🎵 En cours : **${track.title}**`);

  server.player.once(AudioPlayerStatus.Idle, () => playNext(guildId, textChannel));
}

module.exports = {
  async handle(message, args, command) {
    const voiceChannel = message.member.voice.channel;
    const server = getServer(message.guild.id);

    switch (command) {
      case 'play': {
        if (!voiceChannel) return message.reply('❌ Rejoins un salon vocal d\'abord.');
        if (!args[0]) return message.reply('❌ Donne un titre ou une URL YouTube.');

        const query = args.join(' ');
        await message.reply(`🔍 Recherche de **${query}**...`);

        let info;
        try {
          if (play.yt_validate(query) === 'video') {
            info = (await play.video_info(query)).video_details;
          } else {
            const results = await play.search(query, { limit: 1 });
            if (!results.length) return message.channel.send('❌ Aucun résultat trouvé.');
            info = results[0];
          }
        } catch {
          return message.channel.send('❌ Impossible de trouver cette musique.');
        }

        const track = { title: info.title, url: info.url };
        server.queue.push(track);

        // Connexion au salon vocal si pas encore connecté
        if (!server.connection || server.connection.state.status === VoiceConnectionStatus.Destroyed) {
          server.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          server.player = createAudioPlayer();
          server.connection.subscribe(server.player);
          playNext(message.guild.id, message.channel);
        } else {
          message.channel.send(`✅ Ajouté à la file : **${track.title}**`);
        }
        break;
      }

      case 'skip': {
        if (!server.player) return message.reply('❌ Aucune musique en cours.');
        server.player.stop();
        message.reply('⏭️ Musique passée.');
        break;
      }

      case 'stop': {
        server.queue = [];
        server.player?.stop();
        server.connection?.destroy();
        servers.delete(message.guild.id);
        message.reply('⏹️ Musique arrêtée et file vidée.');
        break;
      }

      case 'queue': {
        if (!server.queue.length) return message.reply('📭 La file d\'attente est vide.');
        const list = server.queue.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
        message.reply(`📋 **File d'attente :**\n${list}`);
        break;
      }

      case 'volume': {
        const vol = parseInt(args[0]);
        if (isNaN(vol) || vol < 0 || vol > 100) return message.reply('❌ Volume entre 0 et 100.');
        server.volume = vol / 100;
        message.reply(`🔊 Volume réglé à **${vol}%**`);
        break;
      }
    }
  }
};
