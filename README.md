<div align="center">
  <p>
    <img src="https://i.imgur.com/ybCbZI3.png" width="400" alt="lasty logo">
  </p>
  <strong><i>A Discord bot for fetching Last.FM data.</i></strong>
</div>
<hr />

## What is Lasty?
Lasty is a Discord bot intended to interact with [Last.FM](https://last.fm/) to provide real time listening data.
<br/>
_A public instance of Lasty is currently not available. Follow [Installation](https://github.com/dxnter/lasty#installation) to get started._

## 🚀 Installation
### Prerequisites
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

Create and edit the `.env` file with the required tokens. *Use `.env.sample` for the format*
```console
$ vim .env
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

## 📕 Commands
*Work in progress, writing wiki page.*
<br />
For a list of all available commands:
`,l help`
