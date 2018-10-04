# Miyako
### A WIP Discord bot with powerful moderation/anti-raid features.
### As of now, it has the ability to:
**1.** Detect images that are perceptually similar against banned images set by the administrators.

**2.** Banning/muting members with optional time limit.

**3.** Play music or live streams from various sources other than YouTube, i.e. Soundcloud, Twitch, Mixer, etc.

### **[To Do List](https://trello.com/b/8oubeSKz/miyako)**
[ ] Spam / mention spamming / new line / invite link / message filter.

[x] ~~Chat slow mode~~ Already got implemented by Discord's update.

[ ] Some other anti-raid features I can't think of

[ ] Voice-activated commands?

#### You can invite this bot to your guild via **[this link](https://discordapp.com/oauth2/authorize?client_id=415313696102023169&permissions=8&scope=bot)** or host it locally

# Prerequisite
1. **[Node.js >= 10.10.0](https://nodejs.org/en/download/current/)**
2. **[MongoDB >= 4.0](https://www.mongodb.com/download-center?utm_source=manual&utm_campaign=download-mongodb-navbar-cta&utm_medium=docs#community)**

###

# Hosting Miyako locally (Ubuntu)
**1.** Clone this repository along with Miyako's dashboard
```bash
git clone https://github.com/alexy4744/Miyako.git
git clone https://github.com/alexy4744/Miyako-Dashboard.git
```

**2.** Install Java version >= 10
```bash 
sudo add-apt-repository ppa:linuxuprising/java
sudo apt-get update
sudo apt-get install oracle-java10-installer
```

**3.** Install node-gyp
```bash
sudo npm i -g node-gyp
```

**4.** Install cairo and other canvas dependencies 
```bash
sudo apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev 
```

**5.** Install dependencies
```bash
sudo su
sudo npm i
```

Also, download **[Lavalink](https://github.com/Frederikam/Lavalink)** and place it in `/Miyako/music/` folder.

**6.** Rename `process.env.EXAMPLE` to `process.env` and replace each dummy value with actual values

**Start-up Process**
1. Start MongoDB and Lavalink.
2. Start dashboard and websocket server.
3. Start Miyako.
