const setting = require("../setting.json");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(`./${setting.db.name}`);
function dbsetup() {
  db.serialize(() => {
    db.run("create table if not exists members(name,age)");
    db.run("insert into members(name,age) values(?,?)", "hoge", 33);
    db.run("insert into members(name,age) values(?,?)", "foo", 44);
    db.run("update members set age = ? where name = ?", 55, "foo");
    db.each("select * from members", (err, row) => {
      console.log(`${row.name} ${row.age}`);
    });
    db.all("select * from members", (err, rows) => {
      console.log(JSON.stringify(rows));
    });
    db.get("select count(*) from members", (err, count) => {
      console.log(count["count(*)"]);
    })
  });
}


module.exports = dbsetup;