import Discord from 'discord.js';
import axios from 'axios';
import {
  getUsersTopArtists,
  getUsersTopAlbums,
  getUsersTopTracks
} from '../api/lastfm';
import db from '../db';

async function weeklyStatCron(bot, LASTFM_API_KEY) {
  const users = db.get('users').value();
  users.forEach(async user => {
    console.log(user);
    const { userID, lastFM: fmUser } = user;
    const { description: topArtists } = await getUsersTopArtists(
      fmUser,
      'week',
      null,
      null,
      LASTFM_API_KEY
    );
    const { description: topAlbums } = await getUsersTopAlbums(
      fmUser,
      'week',
      null,
      null,
      LASTFM_API_KEY
    );
    const { description: topTracks } = await getUsersTopTracks(
      fmUser,
      'week',
      null,
      null,
      LASTFM_API_KEY
    );

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
