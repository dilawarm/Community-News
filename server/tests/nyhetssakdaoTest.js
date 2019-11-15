// @flow

let mysql = require("mysql");

const Nyhetssakdao = require("../src/DAO/nyhetssakdao.js");
const runsqlfile = require("../src/DAO/runsqlfile.js");

let pool = mysql.createPool({
    connectionLimit: 1,
    host: "mysql",
    user: "root",
    password: "secret",
    database: "supertestdb",
    debug: false,
    multipleStatements: true
});

let nyhetssakdao = new Nyhetssakdao(pool);

beforeAll(done => {
  runsqlfile("create_tables.sql", pool, () => {
    runsqlfile("create_testdata.sql", pool, done);
  });
});

afterAll(() => {
  pool.end();
});

test("get all articles from db", done => {
  function callback(status, data) {
    console.log(
      "Test callback: status=" + status + ", data=" + JSON.stringify(data)
    );
    expect(data.length).toBe(1);
    expect(data[0].overskrift).toBe("overskrift");
    done();
  }

  nyhetssakdao.getAll(callback);
});

test("get one article from db", done => {
  function callback(status, data) {
    console.log(
      "Test callback: status=" + status + ", data=" + JSON.stringify(data)
    );
    expect(data.length).toBe(1);
    expect(data[0].overskrift).toBe("overskrift");
    done();
  }

  nyhetssakdao.getOneId("Nyheter", 1, callback);
});

test("get one category article from db", done => {
  function callback(status, data) {
    console.log(
      "Test callback: status=" + status + ", data=" + JSON.stringify(data)
    );
    expect(data.length).toBe(0);
    done();
  }

  nyhetssakdao.getKategori("Nyheter", callback);
});

test("add article to db", done => {
  function callback(status, data) {
    console.log(
      "Test callback: status=" + status + ", data=" + JSON.stringify(data)
    );
    expect(data.affectedRows).toBeGreaterThanOrEqual(1);
    done();
  }

  nyhetssakdao.createOne(
    { overskrift: "overskrift2", innhold: "innhold2", bilde: "bilde.jpg", kategori: "Sport", viktighet: false, rating: 0, brukerId: 1},
    callback
  );
});

test("upvote one article in db", done => {
  function callback(status, data) {
    console.log(
      "Test callback: status=" + status + ", data=" + JSON.stringify(data)
    );
    expect(data.affectedRows).toBe(1);
    done();
  }

  nyhetssakdao.upvote(1, callback);
});

test("get one article from db", done => {
  function callback(status, data) {
    console.log(
      "Test callback: status=" + status + ", data=" + JSON.stringify(data)
    );
    expect(data.length).toBe(1);
    expect(data[0].overskrift).toBe(1);
    done();
  }

  nyhetssakdao.getOneId("Nyheter", 1, callback);
});