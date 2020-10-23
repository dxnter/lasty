<div align="center">
  <p>
    <img src="https://i.imgur.com/ybCbZI3.png" width="400" alt="lasty logo">
  </p>
  <strong><i>A Discord bot for fetching Last.FM data.</i></strong>
</div>
<br/>
<div align="center">
  <a href="https://github.com/discordjs">
    <img src="https://img.shields.io/badge/discord.js-v12.4.0-blue.svg?logo=npm" alt="shield.png">
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
For comments and support contact me on Discord: <strong>dxnter#0001</strong>

## 🚀 Getting Started
### Requirements
- [Discord Bot Token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
- [Last.FM API Key](https://last.fm/api)
- [Discord User ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)

### Installation
```bash
# Clone the repository
git clone https://github.com/dxnter/lasty

# Enter into the directory
cd lasty

# Install dependencies
npm install
```

### Configuration
Rename `config.example.json` to `config.json` in the root directory and enter in the correct information for each property.

`OWNERS` can either be a single Discord User ID or multiple ID's separated by a comma. Owners will have complete control over Lasty and bypass command throttling.
```json
{
  "PREFIX": "",
  "OWNERS": "",
  "DISCORD_BOT_TOKEN": "",
  "LASTFM_API_KEY": ""
}
```

### Starting the bot

```bash
npm start
```

#### Advanced
This section is completely optional but suggested if hosting Lasty on a VPS.
<br/>
Globally install `pm2`, this enables Lasty to run as a daemon process.
```bash
npm install --global pm2
```

Start / stop the bot
```bash
pm2 start npm -- start
AND
pm2 stop all
```

## 📝 Commands
[Commands Wiki](https://github.com/dxnter/lasty/wiki/Commands)
