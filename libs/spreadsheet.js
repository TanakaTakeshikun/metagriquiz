const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const setting = require('../setting.json');
require('dotenv').config();
const serviceAccountAuth = new JWT({
  email: process.env.email,
  key: process.env.PRIVATEKEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
class SpreadSheetService {
  /**
   * コンストラクター
   * @param {*} spreadsheetKey スプレッドシートキー
   */
  constructor() {
    this.doc = new GoogleSpreadsheet(setting.spreadsheet, serviceAccountAuth);
  }
  /**
   * 行データを返す
   * @param {*} index 
   */
  async getRows({ type }) {
    if (!(type == 'members' || type == 'system')) return 'Not Type';
    await this.doc.loadInfo().catch(() => 'limit req');
    const sheet = this.doc.sheetsByTitle[type];
    return sheet.getRows();
  }
  /**
   * 行を追加する
   * @param {*} value 
   */
  async set({ uid, count, mid, allcount, type, answer_count, total_count }) {
    if (!(type == 'members' || type == 'system')) return 'Not Type';
    await this.doc.loadInfo().catch(() => 'limit req');
    const sheet = this.doc.sheetsByTitle[type];
    if (type === 'members') return await sheet.addRow({ uid: uid, date: new Date().toLocaleString({ timeZone: setting.quiz.timeZone }), count: count, mid: mid, allcount: allcount });
    if (type === 'system') return await sheet.addRow({ date: new Date().toLocaleString({ timeZone: setting.quiz.timeZone }), count: count, mid: mid, answer_count: answer_count, total_count: total_count });
  }
  /**
   * データを取得する
   * @param {*} callBack 
   */
  async find({ type, uid, count }) {
    if (!(type == 'members' || type == 'system')) return 'Not Type';
    await this.doc.loadInfo().catch(() => 'limit req');
    const sheet = this.doc.sheetsByTitle[type];
    const rows = await sheet.getRows();
    if (type === 'members') return rows.filter(row => row._rawData[0] == uid).map(row => ({ uid: row._rawData[0], date: row._rawData[1], count: row._rawData[2], mid: row._rawData[3], allcount: row._rawData[4], contentid: row._rowNumber }))[0]
    if (type === 'system') return rows.filter(row => row._rawData[1] == count).map(row => ({ mid: row._rawData[0], count: row._rawData[1], date: row._rawData[2], answer_count: row._rawData[3], total_count: row._rawData[4] }))[0];
  }
  /**
 * データの詳細を取得する
 * @param {*} callBack 
 */
  async all({ type }) {
    if (!(type == 'members' || type == 'system' || type == 'quizlist')) return 'Not Type';
    await this.doc.loadInfo().catch(() => 'limit req');
    const sheet = this.doc.sheetsByTitle[type];
    const rows = await sheet.getRows();
    return rows
  }
  /** 
   * idに紐づくユーザーの情報を更新する
  */
  async update({ uid, count, allcount, type, answer_count, total_count, mid, date }) {
    if (!(type == 'members' || type == 'system')) return 'Not Type';
    await this.doc.loadInfo().catch(() => 'limit req');
    const sheet = this.doc.sheetsByTitle[type];
    const rows = await sheet.getRows();
    for (const row of rows) {
      if (type === 'members') {
        if (row._rawData[0] === uid) {
          row._rawData = [uid || null, date || null, count || null, mid || null, allcount || null]
          await row.save()
        }
      }
      if (type === 'system') {
        if (row._rawData[1] == count || row._rawData[0] == mid) {
          row._rawData = [mid || null, count || null, date || null, answer_count || null, total_count || null]
          await row.save()
        }
      }
    }
  }
}

module.exports = SpreadSheetService