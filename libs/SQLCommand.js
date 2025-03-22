const setting = require('../setting.json');
const sqlite3 = require('sqlite3');
const path = require('node:path');
const db = new sqlite3.Database(`${path.resolve('.')}/sql/${setting.db.name}`);

class SQLCommand {
  constructor() {
    db.run(`create table if not exists members(uid VARCHAR(20) NOT NULL,date DATE NOT NULL,count INTEGER NOT NULL,mid VARCHAR(20)  NOT NULL)`);
    db.run(`create table if not exists system(mid VARCHAR(20)  NOT NULL,date DATE NOT NULL,count INTEGER NOT NULL)`);
  }
  set(data) {
    if (data.type === 'members') return db.run(`insert into members(uid,date,count,mid) values(?,?,?,?)`, data.uid, new Date(new Date().toLocaleString({ timeZone: setting.quiz.timeZone })), data.count, data.mid);
    if (data.type === 'system') return db.run(`insert into system(mid,date,count) values(?,?,?)`, data.mid, new Date(new Date().toLocaleString({ timeZone: setting.quiz.timeZone })), data.count);
    return 'Not Type';
  }
  delete(data) {
    if (data.type === 'members') db.run(`delete from members WHERE uid = ?`, data.uid);
    if (data.type === 'system') db.run(`delete from system WHERE mid = ?`, data.mid);
    return 'Not Type';
  }
  async find(data) {
    return new Promise((resolve, reject) => {
      if (data.type === 'members') {
        db.get(`SELECT * FROM members WHERE uid = ?`, data.uid, (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      } else if (data.type === 'system') {
        db.get(`SELECT * FROM system`, (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      } else {
        resolve('Not Type');
      }
    });
  }
  update(data) {
    if (data.type === 'members') return db.run(`update members set count = ?,mid = ?,date = ? where uid = ?`, data.count, data.mid, new Date(new Date().toLocaleString({ timeZone: setting.quiz.timeZone })), data.uid);
    if (data.type === 'system') return db.run(`update system set date = ?,count = ?,mid = ? where count = ?`, new Date(new Date().toLocaleString({ timeZone: setting.quiz.timeZone })), data.count, data.mid, data.count - 1);
    return 'Not Type';
  }
}

module.exports = {
  SQLCommand
};