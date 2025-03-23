const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const setting = require("../setting.json");
const serviceAccountAuth = new JWT({
  email: "metagrilabo-quiz@metagri-discord-v1.iam.gserviceaccount.com",
  key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPDHkNm7ggIQo1\no8pfKbm6bPR7oH94Ucm03jjldR7CqVfvmB9VowkbG5s2uaiYeJISSgYq2lkqFlnM\nYzTe8l7D9gXXcoyeFat9p04eRWHhXtf0CTPEw7AuABobjVy2ZSOjFnHmRFpGLppp\nh4nyodaySCkGI5eWsc44kKMcBlxVam0wYQIDv5lBLfsgvr18+ZuVule0Ph1WaIKF\nzfdVNZvww9IwE2VQsUuXd+L1oySF8zhVqvt8dmsae8bsYcvdPgc352y4sghUls5T\n+q10x+/ag4Wpzj5+Fkl2c281gVghjiMppSJBWGaBbLrPsJ2/ESzXrAu7kdFpxjsX\n+Dae3H4vAgMBAAECggEAKMp0yO0OW+oWeFXiB1iRmjxf+EE5C8vVONh1DiPCYSh6\nxh3KwpThtOD99cyi/hL2+Dp0N5oX6fZIT7+VyXynleTQ5s7PDFAJnrJI7ibOL1f/\npLjxZYkGGzHy8s2pX9fSKw2/d9WskVoaGsNUtqQSx8H2rxpxAYPbNIKuV9Wa+Eqp\n535D3kpRbcwS5v2bORGLHVIqeIqwOwVH3injfsTif51cDoBNIPTFiIjStBv9wamN\nTLug51n8BWKOVZBOYp8wA4TUXDHneM5tWiZcu4j+ZaMzV9BE6q3FaQ4qr/HfbA2Q\nIgUOpaXJevSRi0du9asMWRxqpoLR7Fhox2HHBGdnhQKBgQD4na125oZt1kq9maKu\n9Eu9Ci+SnzwpU+cTofZkAHuniLTy62WW+IT/ganseZ34FncVw6ctJsQ8wiOwGiJD\n0fG9kevy6fngmVZHOi4TBbNZu3EYsO4ddTXok7Dd9n7/c4vRg6U1Znsa0s6BEBbE\n0SswDWGgsfQ+9qpNzjsgkvEUDQKBgQDVMr5r4pSWwBDMq2nGhxPqrpxpDLJkCisq\ntwmJgN/MuOB+Ix05D0etzEIREv3APCVcltqpYxJdoDdrWkAqunsElfmTJXLV8JHT\njaLKMyrz848erxDy/KEgrbXpqegjKteJstL+R3ChMT/JyWp5qsXgeULg6YaQVbLZ\niMdCb66gKwKBgE578HPVqGBqQuQB6UKT6oj9+zCtRh/B1fPzsEW3hVHJLV52g3aa\nc9n5Q/xcFEtqRCPBxTfSwiZwHzYLuf9w+oCe3T6tMG3/2iXYLw1gQlM0giqKSFFS\nXDdU0IPxufvIrT3x8iiedoRsQjaqLpXpdlnQD57cLr/lvLOdRDsvSB3NAoGBAMBv\n3CefTkXAOam0M3bKKDUVxQKhPkhEUXBt5MLju56bZa8VXORLIYUDsMKepMKmx4aK\nd/abAVHXMw7IWND4n9+ky7CBBeWMDuSonL7sbqHiP1YP6TmaxImtoly2S12q5wBY\nlFCHBWfJ/2zRTDVj6tZSPgarYxXW9OebqVgTXMkfAoGANPSp2Uv7IBndt9I9XYs9\n4GzoqxGAVGYxt+4xrGzMyQFB05tgd+yHBVPF4hgmV+oUhji+O/yrceyAZuBW1v4y\nreWjY37r4lrREt0ZTtYgVb56Z/QTtfylz4p++EIOMJG3t2Sl5Kl9Bch6PrYAVpl2\nefe0EfmIptdeFkfpRXvJneE=\n-----END PRIVATE KEY-----\n",
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

class SpreadSheetService {
  /**
   * コンストラクター
   * @param {*} spreadsheetKey スプレッドシートキー
   */
  constructor(spreadsheetKey) {
    this.doc = new GoogleSpreadsheet('1Pi51uKKRQHoRPTDcKc57M12yjeb5ivBc_ZU3_fubFrA', serviceAccountAuth);
  }
  /**
   * 行データを返す
   * @param {*} index 
   */
  async getRows(index) {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[index]
    return sheet.getRows();
  }
  /**
   * 行を追加する
   * @param {*} value 
   */
  async set({ uid, count, mid, allcount, type }) {
    const index = (type === "members") ? 0 : 1;
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[index];
    if (type === "members") return await sheet.addRow({ uid: uid, date: new Date(new Date().toLocaleString({ timeZone: setting.quiz.timeZone })), count: count, mid: mid, allcount: allcount });
    if (type === "system") return await sheet.addRow({ date: new Date(new Date().toLocaleString({ timeZone: setting.quiz.timeZone })), count: count, mid: mid });
  }
  /**
   * データを取得する
   * @param {*} callBack 
   */
  async find({ type, uid, mid }) {
    const index = (type === "members") ? 0 : 1;
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[index];
    const rows = await sheet.getRows();
    const data = []

    if (type === "members") return rows.filter(row => row._rawData[0] === uid).map(row => ({ uid: row._rawData[0], date: row._rawData[1], count: row._rawData[2], mid: row._rawData[3], allcount: row._rawData[4], contentid: row._rowNumber }))
    if (type === "system") return rows.filter(row => row._rawData[0] === mid).map(row => ({ mid: row._rawData[0], count: row._rawData[1], date: row._rawData[2], answer_count: row._rawData[2] }));

  }
  /** 
   * idに紐づくユーザーの情報を更新する
  */
  async updateById(id, value) {
    const rows = await this.getRows(0);
    for (const row of rows) {
      if (row.id == id) {
        for (const attr in value) {
          row[attr] = value[attr]
          await row.save()
        }
      }
    }
  }
  /**
   * idに紐づくユーザーを削除する
   * @param {*} id 
   */
  async deleteById(id) {
    const rows = await this.getRows(0);
    for (const row of rows) {
      if (row.id == id) {
        await row.delete()
      }
    }
  }
}

module.exports = SpreadSheetService