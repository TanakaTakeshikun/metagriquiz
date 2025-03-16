module.exports = {
  builder: (builder) => builder
      .setName("test")
      .setDescription("動作確認用")
      .addStringOption((option) => option
          .setName("test")
          .setDescription("テスト")
          .setRequired(true)
          .setAutocomplete(true)
      )
  ,
  autocomplete(command) {
      return [
          {
              name: "test",
              value: "test"
          }
      ];
  },
  async execute(command) {
      command.reply(`test: ${command.options.getString("test")}`)
  }
};