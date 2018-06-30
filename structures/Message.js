const { Structures } = require("discord.js");

Structures.extend("Message", Message => {
  class VoidMessage extends Message {
    _patch(data) {
      super._patch(data);
      this.emojis = {
        success: "✅  ｜   ",
        fail: "❌  ｜   ",
        pending: "⏳  ｜   ",
        bar: "  ｜   "
      };
      this.colors = {
        success: 0x76B354,
        fail: 0xDE2E43,
        pending: 0xFFAC32,
        empty: 0x36393e,
        default: 0x5089DB
      };
    }
  }

  return VoidMessage;
});