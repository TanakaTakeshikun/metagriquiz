const { Colors, EmbedBuilder } = require('discord.js');
const setting = require('../setting.json');

class CustomEmbed extends EmbedBuilder {
  constructor() {
    super();
    this.setFooter({
      text: setting.bot.embed.Footer.CR
    });
    this.date = new Date();
  }

  typeSuccess() {
    this.setTitle('✅成功');
    this.setColor(Colors.Green);
    return this;
  }

  typeError() {
    this.setTitle('⚠エラー');
    this.setColor(Colors.Red);
    return this;
  }

  toJSON() {
    if (!this.data.timestamp) this.setTimestamp();
    return super.toJSON();
  }

  setTimestamp(timestamp = Date.now()) {
    super.setTimestamp(new Date(timestamp)); // Dateオブジェクトに変換
    return this;
  }

  setColor(color) {
    super.setColor(color);
    return this;
  }

  setTitle(title) {
    super.setTitle(title);
    return this;
  }

  setThumbnail(thumbnail) {
    super.setThumbnail(thumbnail);
    return this;
  }

  setURL(url) {
    super.setURL(url);
    return this;
  }

  setAuthor(data) {
    super.setAuthor(data);
    return this;
  }

  setDescription(text) {
    super.setDescription(text);
    return this;
  }

  addFields(fields) {
    super.addFields(fields);
    return this;
  }

  create() {
    return new EmbedBuilder(this.toJSON());
  }
}

module.exports = {
  CustomEmbed
};
