const Base = require("./Base");
const regexps = require("./regexps");
const snekfetch = require("snekfetch");

module.exports = class Lavalink extends Base {
  constructor(...args) { super(...args); }

  playerInit(guild) {
    this.send({
      "id": guild.id,
      "queue": guild.player ? guild.player.queue ? guild.player.queue : [] : [],
      "track": guild.player ? guild.player.queue[0] ? guild.player.queue[0].info : false : false,
      "time": guild.player ? guild.player.musicPlayTime() : false
    });
  }

  playerFinish(guild) {
    if (!guild.player) return;

    this.stop(guild);
    setTimeout(() => this.skip(guild), 100);
  }

  async getSong(query) {
    let found = false;
    let source;

    for (const regex in regexps) {
      for (const src in regexps[regex]) {
        if (Array.isArray(regexps[regex][src])) {
          for (const pattern of regexps[regex][src]) {
            if (pattern.test(query)) {
              found = true;
              source = regex;
              break;
            }
          }
        } else if (regexps[regex][src].test(query)) {
          found = true;
          source = regex;
          break;
        }
      }

      if (found) break;
    }

    // Default to youtube search if it doesnt match any links
    if (!found) {
      query = `ytsearch:${query}`;
      source = "youtube";
    }

    const res = await snekfetch
      .get(`http://${this.client.player.host}:${this.client.player.APIport}/loadtracks`)
      .query({ identifier: query })
      .set("Authorization", "youshallnotpass")
      .catch(error => ({ error }));

    if (res.error) return Promise.reject(res.error);
    if (!res) return Promise.reject(new Error(`I couldn't GET from http://${this.client.player.host}:${this.client.player.APIport}/loadtracks`));

    for (const track of res.body.tracks) {
      track.info.looped = false;
      track.info.loadType = res.body.loadType;
      track.info.playlistInfo = res.body.playlistInfo;
      track.info.source = source;
    }

    return Promise.resolve(res.body.tracks);
  }

  // Always get the highest quality thumbnail if possible
  async getThumbnail(trackInfo) {
    if (trackInfo.source === "youtube") {
      const res = await snekfetch
        .get(`https://www.googleapis.com/youtube/v3/videos?id=${trackInfo.identifier}&part=snippet&key=${process.env.YT}`)
        .catch(error => ({ error }));

      if (res.error) return `http://i3.ytimg.com/vi/${trackInfo.identifier}/hqdefault.jpg`;
      if (res.body.items[0].snippet.thumbnails.maxres) return res.body.items[0].snippet.thumbnails.maxres.url;

      return `http://i3.ytimg.com/vi/${trackInfo.identifier}/hqdefault.jpg`;
    } else if (trackInfo.source === "soundcloud") {
      const res = await snekfetch
        .get(`http://api.soundcloud.com/resolve?url=${trackInfo.uri}&client_id=${process.env.SOUNDCLOUD}`)
        .catch(error => ({ error }));

      if (res.error) return null;

      return res.body.artwork_url;
    }
  }

  play(guild) {
    guild.player.playing = true;
    guild.player.musicStart = new Date(); // when the song start I get the date when it starts
    guild.player.musicPauseAll = null; // this is only to make sure everything is back to default
    guild.player.musicPause = null; // this too
    guild.player.musicPlayTime = () => {
      // Here I look if there is something in musicPauseAll and if the music is currently paused
      if (guild.player.musicPauseAll && guild.player.musicPause) {
        // if it is then I do this insane math that I will write under
        // now = the time now but in miliseconds (                         same shit that is under in the parenthese)
        // start = miliseconds of the date when the music started (remember that it's from the date so it will be all miliseconds of all the time to this date)
        // all = miliseconds of all the time the music has been paused
        // pause = miliseconds of the date when the music got paused
        // so now here is the formula
        // (now - start) - (all + (now - pause))
        // well first we need to get the miliseconds of how much time from now and the pause variable since remember the pause is miliseconds from the date
        // so you do now - pause = miliseconds the music is currently paused for
        // after you add all to this since all is already the miliseconds of only the time it has been paused so we don't need to substract it to now (it's already done under in resume)
        // so now you got all the time it has been paused for
        // now you want the time it has been playing
        // so you do now - start = miliseconds the music should have been playing without any pausing include
        // so you only need to do the miliseconds of the play time - the pause time and voila
        // basically that's the steps how I said it  4. (3. now - start) - (2. all + (1. now - pause))
        // the 4 is actually the two brackets substracted I am pretty sure you get it ok this seemspretty understandable
        return ((new Date()).getTime() - guild.player.musicStart.getTime()) - (guild.player.musicPauseAll + ((new Date()).getTime() - guild.player.musicPause.getTime()));
      } else if (guild.player.musicPause) { // so this else if just checks whether it is paused?
        // well here you just don't add the all in this since it doesn't have anything ye aight
        // (now - start) - (now - pause)
        return ((new Date()).getTime() - guild.player.musicStart.getTime()) - ((new Date()).getTime() - guild.player.musicPause.getTime());
      } else if (guild.player.musicPauseAll) { // look if the music has been paused but is still playing currently
        // you do the same but without adding the now - pause since it's not currently paused
        // (now - start) - all
        return ((new Date()).getTime() - guild.player.musicStart.getTime()) - guild.player.musicPauseAll;
      } else { // eslint-disable-line
        // (now - start) - (all + (now - pause)
        return (new Date()).getTime() - guild.player.musicStart.getTime(); // here is when there was no pause
      }
    };

    guild.player.seekTime = time => {
      guild.player.musicStart = new Date((new Date()).getTime() - Number(time));
      if (guild.player.musicPause) guild.player.musicPause = new Date();
      guild.player.musicPauseAll = null;
    };

    this.send({
      "op": "play",
      "guildId": guild.id,
      "track": guild.player.queue[0].track
    });
  }

  seek(guild, pos) {
    guild.player.seekTime(pos);

    this.send({
      "op": "seek",
      "guildId": guild.id,
      "position": pos
    });
  }

  skip(guild) {
    if (!guild.player.queue[0] || guild.player.queue[0].info.looped) return;

    guild.player.queue.shift();

    if (guild.player.queue.length > 0) {
      this.play(guild);
    } else {
      if (!this.client.wss) return;

      this.stop(guild);

      this.client.wss.send({
        "op": "finished",
        "id": guild.id
      });
    }
  }

  resume(guild) {
    this.send({
      "op": "pause",
      "guildId": guild.id,
      "pause": false
    });

    // so here when it's resume I look if there is something in musicPauseAll since it's where all the paused miliseconds will go added together
    // with the math that you can is basically to get the miliseconds but not from the date but the duration
    // so what I do is the current date miliseconds - the miliseconds of the pause date and that gives you the time it has been paused in miliseconds
    // after I just add it to musicPauseAll or I set the value to the miliseconds of the pause if there is nothing in it
    if (guild.player.musicPauseAll) guild.player.musicPauseAll += ((new Date()).getTime() - guild.player.musicPause.getTime());
    else guild.player.musicPauseAll = (new Date()).getTime() - guild.player.musicPause.getTime();

    guild.player.musicPause = null; // this is an extremely important line since I make musicPause null again, and this is to know if the music is currently in pause or not if null == not paused if there is something the music is paused
    guild.player.paused = false;
    guild.player.playing = true;
  }

  pause(guild) {
    // When pause is used I get the date of when the user paused the music
    guild.player.musicPause = new Date();
    guild.player.paused = true;
    guild.player.playing = false;

    this.send({
      "op": "pause",
      "guildId": guild.id,
      "pause": true
    });
  }

  volume(guild, vol) {
    this.send({
      "op": "volume",
      "guildId": guild.id,
      "volume": vol
    });

    guild.player.volume = parseInt(vol);
  }

  stop(guild) {
    this.send({
      "op": "stop",
      "guildId": guild.id
    });

    guild.player.paused = false;
    guild.player.playing = false;

    guild.player.musicStart = null;
    guild.player.musicPauseAll = null;
    guild.player.musicPause = null;
  }

  destroy(guild) {
    this.stop(guild);

    guild.player.queue = [];

    return this.send({
      "op": "destroy",
      "guildId": guild.id
    });
  }

  leave(guild) {
    this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": guild.id,
        "channel_id": null,
        "self_mute": false,
        "self_deaf": false
      }
    });

    guild.player.channelId = null;
    guild.player.playing = false;
  }

  join(msg) {
    return this.send({
      "op": 4,
      "shard": this.client.player.shards,
      "d": {
        "guild_id": msg.guild.id,
        "channel_id": msg.member.voice.channel.id,
        "self_mute": false,
        "self_deaf": false
      }
    });
  }
};