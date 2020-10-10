<div align="center">
  <p>
    <img src="https://i.imgur.com/ybCbZI3.png" width="400" alt="lasty logo">
  </p>
  <strong><i>A Discord bot for fetching Last.FM data.</i></strong>
</div>
<br/>
<div align="center">
  <a href="https://github.com/discordjs">
    <img src="https://img.shields.io/badge/discord.js-v12.3.1-blue.svg?logo=npm" alt="shield.png">
  </a>
  <a href="https://github.com/dxnter/lasty/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-GNU%20GPL%20v3-green" alt="License shield">
  </a>
</div>
<hr />

## About
Lasty is a Discord bot intended to interact with [Last.FM](https://last.fm/) to provide real time listening data.
<br/>
_A public instance of Lasty is currently not available. Follow [Installation](https://github.com/dxnter/lasty#installation) to get started._
<br/>
For comments and support contact me on Discord: <strong>dxnter#1600</strong>
## 🚀 Installation
### Requirements
- [Discord Bot Token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
- [Last.FM API Key](https://last.fm/api)


Clone the repo:
```console
$ git clone https://github.com/dxnter/lasty
$ cd lasty
```

Install dependencies:
```console
$ npm install
```

Create and edit the `.env` file with the required tokens.
```console
$ vim .env
```
⬇️ Format for `.env`
```env
PREFIX=
DISCORD_BOT_TOKEN=
LASTFM_API_KEY=
```

Globally install `pm2` *(This enables Lasty to continuously run)*
```console
$ npm install --global pm2
```

Start / stop the bot
```console
$ pm2 start npm -- start
OR
$ pm2 stop all
```

## 📝 Commands
*Work in progress, writing wiki page.*
<br />
For a list of all available commands:
`,l help`
