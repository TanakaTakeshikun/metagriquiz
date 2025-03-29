const { CustomEmbed, spreadsheet } = require('../libs');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors } = require('discord.js');

const spsheet = new spreadsheet();
let quiz = [];

/**
 * 非同期でクイズデータを取得し、`quiz` 配列に格納
 * @async
 * @returns {Promise<void>}
 */
(async () => {
  try {
    const rawdata = await spsheet.all({ type: 'quizlist' });
    quiz = rawdata.map(({ _rawData }) => ({
      category: _rawData[0],
      question: _rawData[1],
      choices1: _rawData[2],
      choices2: _rawData[3],
      choices3: _rawData[4],
      choices4: _rawData[5],
      answer: _rawData[6],
      qid: _rawData[7]
    }));
  } catch (error) {
    console.error('クイズデータの取得に失敗しました:', error);
  }
})();

/**
 * 指定されたクイズ番号のクイズを作成する関数
 * @param {number} number - クイズのインデックス（0から始まる）
 * @returns {{embed: Object, row: ActionRowBuilder}} クイズの埋め込みメッセージとボタン行
 */
function createquiz(number) {
  if (!quiz[number]) {
    throw new Error(`クイズデータが見つかりません: index ${number}`);
  }

  // クイズの埋め込みメッセージ作成
  const embed = new CustomEmbed()
    .setTitle(`カテゴリー: ${quiz[number].category}`)
    .setDescription(
      `${quiz[number].question}\n正解だと思う選択肢のボタンを押してください。\n\`qid:${quiz[number].qid}\``
    )
    .addFields([
      { name: '', value: `1: ${quiz[number].choices1}` },
      { name: '', value: `2: ${quiz[number].choices2}` },
      { name: '', value: `3: ${quiz[number].choices3}` },
      { name: '', value: `4: ${quiz[number].choices4}` },
    ])
    .setColor(Colors.White)
    .create();

  // クイズのボタン作成
  const buttons = [1, 2, 3, 4].map((num) =>
    new ButtonBuilder()
      .setCustomId(`quiz_${number}_${num}`)
      .setLabel(num.toString())
      .setStyle(ButtonStyle.Primary)
  );

  // ボタンをアクション行に追加
  const row = new ActionRowBuilder().addComponents(buttons);

  return { embed, row };
}

module.exports = createquiz;
