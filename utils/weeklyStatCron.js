import Discord from 'discord.js';
import db from '../db';
import getCronData from '../utils/getCronData'


async function weeklyStatCron(bot, LASTFM_API_KEY) {
  const users = db.get('users').value();
  users.forEach(async user => {
    const { userID, lastFM: fmUser } = user;
    const { topArtists, topAlbums, topTracks, weeklyScrobbles  } = await getCronData(fmUser, LASTFM_API_KEY)

    // Make this into a single embed not multiple messages
    bot
      .fetchUser(userID)
      .then(user => {
        user.send(
          [':musical_note: **__Last.FM Weekly Stats__**\n', '**Top Artists**'],
          new Discord.RichEmbed().setDescription(topArtists).setColor('#E31C23')
        );
        user.send(
          '**Top Albums**',
          new Discord.RichEmbed().setDescription(topAlbums).setColor('#E31C23')
        );
        user.send(
          '**Top Tracks**',
          new Discord.RichEmbed().setDescription(topTracks).setColor('#E31C23')
        );
      })
      .catch(err => {
        console.log(err);
      });
  });
}

export default weeklyStatCron;
