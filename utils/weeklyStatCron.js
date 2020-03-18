import Discord from 'discord.js';
import dayjs from 'dayjs';
import db from '../db';
import getCronData from '../utils/getCronData';

async function weeklyStatCron(bot) {
  const users = db.get('users').value();
  users.forEach(async user => {
    const { userID, lastFM: fmUser } = user;
    const {
      topArtists,
      topAlbums,
      topTracks,
      lastFMAvatar,
      weeklyScrobbles
    } = await getCronData(fmUser);
    const now = dayjs().format('M/D');
    const lastWeek = dayjs()
      .subtract(7, 'day')
      .format('M/D');

    bot
      .fetchUser(userID)
      .then(user => {
        user.send(
          new Discord.RichEmbed()
            .setColor('#E31C23')
            .setTitle(`:musical_note: Weekly Recap (${lastWeek} - ${now})`)
            .setAuthor(
              `Last.FM | ${fmUser}`,
              lastFMAvatar,
              `https://last.fm/user/${fmUser}`
            )
          .setDescription(`Scrobbles • \`${weeklyScrobbles} ▶️\``)
        );
        user.send(
          new Discord.RichEmbed()
            .setColor('#E31C23')
            .setTitle('**:man_singer: Top Artists**')
            .setDescription(topArtists)
        );
        user.send(
          new Discord.RichEmbed()
            .setColor('#E31C23')
            .setTitle('**:cd: Top Albums**')
            .setDescription(topAlbums)
        );
        user.send(
          new Discord.RichEmbed()
            .setColor('#E31C23')
            .setTitle('**:repeat: Top Tracks**')
            .setDescription(topTracks)
        );
      })
      .catch(err => {
        console.log(err);
      });
  });
}

export default weeklyStatCron;
