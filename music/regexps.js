module.exports = {
  youtube: {
    playlist: /(https|http):\/\/(www)?\.?(youtube\.com|youtu\.be)\/playlist\?list=/i,
    link: /(https|http):\/\/(www)?\.?(youtube\.com|youtu\.be)\/watch\?v=/i
  },

  soundcloud: {
    playlist: /(https|http):\/\/(www)?\.?soundcloud\.com\/.*?\/sets/i,
    link: /(https|http):\/\/(www)?\.?soundcloud\.com/i
  },

  twitch: {
    link: /(https|http):\/\/(www)?\.?twitch\.tv\/.*?/i
  },

  mixer: {
    link: /(https|http):\/\/(www)?\.?mixer\.com\/.*?/i
  },

  vimeo: {
    link: /(https|http):\/\/(www)?\.?vimeo\.com\/.*?/i
  },

  http: {
    link: [
      /(https|http):\/\/(www)?\.?.*?\/.*?\.mp3/i,
      /(https|http):\/\/(www)?\.?.*?\/.*?\.mp4/i,
      /(https|http):\/\/(www)?\.?.*?\/.*?\.wav/i,
      /(https|http):\/\/(www)?\.?.*?\/.*?\.ogg/i
    ]
  }
};