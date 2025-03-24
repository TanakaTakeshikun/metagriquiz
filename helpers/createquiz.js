const { CustomEmbed, spreadsheet } = require('../libs');
const spsheet = new spreadsheet();
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors } = require('discord.js');
let quiz;
(async()=>{
  const rawdata = await spsheet.all({ type: 'quizlist' });
  quiz = rawdata.map(({ _rawData }) => ({ category: _rawData[0], question: _rawData[1], choices1: _rawData[2], choices2: _rawData[3], choices3: _rawData[4], choices4: _rawData[5], answer: _rawData[6], qid: _rawData[7] }))
})();

function createquiz(number) {
  const embed =
    new CustomEmbed()
      .setTitle(`カテゴリー:${quiz[number].category}`)
      .setDescription(`${quiz[number].question}\n正解だと思う選択肢のボタンを押してください。\n\`qid:${quiz[number].qid}\``)
      .addFields([{
        name: '',
        value: `1:${quiz[number].choices1}`
      },
      {
        name: '',
        value: `2:${quiz[number].choices2}`
      },
      {
        name: '',
        value: `3:${quiz[number].choices3}`
      },
      {
        name: '',
        value: `4:${quiz[number].choices4}`
      }])
      .setColor(Colors.White)
      .create();

  const Button1 = new ButtonBuilder()
    .setCustomId(`quiz_${number}_1`)
    .setLabel('1')
    .setStyle(ButtonStyle.Primary);

  const Button2 = new ButtonBuilder()
    .setCustomId(`quiz_${number}_2`)
    .setLabel('2')
    .setStyle(ButtonStyle.Primary);

  const Button3 = new ButtonBuilder()
    .setCustomId(`quiz_${number}_3`)
    .setLabel('3')
    .setStyle(ButtonStyle.Primary);

  const Button4 = new ButtonBuilder()
    .setCustomId(`quiz_${number}_4`)
    .setLabel('4')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder()
    .addComponents(Button1, Button2, Button3, Button4);
  return ({ embed: embed, row: row })
}


module.exports = createquiz;