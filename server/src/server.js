// @flow

let express = require("express");
let mysql = require("mysql");
let bodyParser: function = require("body-parser");
let bcrypt: function = require("bcryptjs");
let jwt: function = require("jsonwebtoken");
let fs = require("fs");
let app = express();
let server = app.listen(8080, () => console.log("Listening on port 8080"));

const NyhetssakDao = require("./DAO/nyhetssakdao.js");
const KommentarDao = require("./DAO/kommentardao.js");
const BrukerDao = require("./DAO/brukerdao.js");

app.use(bodyParser.json()); // for å tolke JSON i body

let config: {host: string, user: string, password: string, database: string, key: string} = require("./config")

let publicKey: string = "";
let privateKey: string = (publicKey = config.key);

let pool = mysql.createPool({
	connectionLimit: 2,
	host: config.host,
	user: config.user,
	password: config.password,
	database: config.database,
	debug: false
});

let nyhetssakDao = new NyhetssakDao(pool);
let kommentarDao = new KommentarDao(pool);
let brukerDao = new BrukerDao(pool);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
	res.header("Access-Control-Request-Headers", "x-access-token");
	res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});

app.post("/login", (req: {body: {brukernavn: string, passord: string}}, res) => {
	pool.getConnection((err, connection: function) => {
		if (err) {
			console.log("Feil ved kobling til databasen");
			res.json({ error: "feil ved oppkobling" });
		} else {
			connection.query(
				"SELECT passord FROM BRUKER WHERE brukernavn=?",
				[req.body.brukernavn],
				(err, rows: [{passord: string}]) => {
					connection.release();
					if (err) {
						console.log(err);
						res.status(500);
						res.json({ error: "Feil ved insert" });
					} 
					else if (!rows[0]) {
						res.json({ "error": "feil_bruker"});
					}
					else {
						if (bcrypt.compareSync(req.body.passord, rows[0].passord)) {
							console.log("Brukernavn & passsord ok");
							let token = jwt.sign({ brukernavn: req.body.brukernavn }, privateKey, {
								expiresIn: 3600
							});
							res.json({ jwt: token });
						} else {
							console.log("Brukernavn & passord ikke ok");
							res.status(401);
							res.json({ error: "Not authorized "});
						}
					}
				}
			)
		}
	});
});

app.post("/registrer", (req, res) => {
	console.log("Fikk POST-request fra klienten");
	//console.log("Brukernavn: " + req.body.brukernavn);
	//console.log("Passord: " + req.body.passord);
	pool.getConnection((err, connection: function) => {
		if (err) {
			console.log("Feil ved oppkobling");
			res.json({ error: "feil ved oppkobling" });
		} else {
			console.log("Fikk databasekobling");
			const brukernavn = req.body.brukernavn;
			const passord = req.body.passord;
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(passord, salt, function(err, hash) {
					connection.query(
						"INSERT INTO BRUKER (brukernavn, passord) values (?, ?)",
						[brukernavn, hash],
						err => {
							if (err) {
								console.log(err);
								res.status(500);
								res.json({ error: "Feil ved insert" });
							} else {
								console.log("insert ok");
								res.send("");
							}
						}
					);
				});
			});
		}
	});
});

app.post("/token", (req, res) => {
	let token = req.headers["x-access-token"];
	console.log(token);
	jwt.verify(token, publicKey, (err, decoded) => {
		if (err) {
			console.log(err);
			console.log("Token IKKE ok");
			res.status(401);
			res.json({ error: "Not authorized" });
		} else {
			token = jwt.sign({ brukernavn: req.body.brukernavn}, privateKey, {
				expiresIn: 3600
			});
			res.json({ jwt: token });
		}
	});
});


app.get("/nyhetssaker", (req, res) => {
	console.log("/nyhetssaker: Fikk GET-request fra klienten");
    nyhetssakDao.getAll((status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/nyhetssaker/:kategori", (req, res) => {
	console.log("/nyhetssaker/:kategori: Fikk GET-request fra klient");
    nyhetssakDao.getKategori(req.params.kategori, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/nyhetssaker/:kategori/:saksId", (req, res) => {
    console.log("/nyhetssaker/:kategori/:id: Fikk GET-request fra klient");
    nyhetssakDao.getOneId(req.params.kategori, req.params.saksId, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/nyhetssaker", (req, res) => {
    console.log("/nyhetssaker: Fikk POST-request fra klient");
    nyhetssakDao.createOne(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.delete("/nyhetssaker/:saksId", (req, res) => {
	console.log("nyhetssaker/: Fikk DELETE-request fra klienten");
    pool.getConnection((err, connection: function) => {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved kobling til databasen");
            res.json({ error: "feil ved oppkobling" });
        } else {
            connection.query(
				"DELETE FROM KOMMENTAR WHERE KOMMENTAR.saksId=?",
				[req.params.saksId],
				(err, rows) => {
					connection.release();
					if (err) {
						console.log(err);
						res.json({ error: "error querying" });
					} else {
						nyhetssakDao.deleteOne(req.params.saksId, (status, data) => {
							res.status(status);
							res.json(data);
						});
					}
				}
			);
        }
    });
});

app.put("/nyhetssaker/:saksId/upvote", (req, res) => {
    console.log("nyhetssaker/:saksId/upvote: Fikk PUT-request fra klienten");
    nyhetssakDao.upvote(req.params.saksId, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/nyhetssaker/:saksId/downvote", (req, res) => {
	console.log("nyhetssaker/:saksId/downvote: Fikk PUT-request fra klienten");
	nyhetssakDao.downvote(req.params.saksId, (status, data) => {
		res.status(status);
		res.json(data);
	});
});

app.get("/livefeed", (req, res) => {
    //console.log("livefeed: Fikk GET-request fra klienten");
    nyhetssakDao.getLivefeed((status, data) => {
        res.status(status);
        res.json(data);
    });
})

app.get("/nyhetssaker/:kategori/:saksId/kommentarer", (req, res) => {
	console.log("/nyhetssaker/:kategori/:saksId/kommentarer: Fikk GET-request fra klient");
    kommentarDao.getAll(req.params.kategori, req.params.saksId, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/nyhetssaker/:saksId", (req, res) => {
    console.log("nyhetssaker/:saksId: Fikk POST-request fra klient");
    kommentarDao.createOne(req.params.saksId, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.delete("/nyhetssaker/kommentarer/:kommId", (req, res) => {
	console.log("nyhetssaker/kommentarer/:kommId");
	kommentarDao.deleteOne(req.params.kommId, (status, data) => {
		res.status(status);
		res.json(data);
	});
});

app.put("/nyhetssaker/rediger/:saksId", (req, res) => {
	console.log("nyhetssaker/saksId: Fikk PUT-request fra klient");
	nyhetssakDao.updateSak(req.params.saksId, req.body, (status, data) => {
		res.status(status);
		res.json(data);
	});
});

app.get("/brukere/:brukernavn", (req, res) => {
	console.log("/bruker/:brukerId: Fikk GET-request fra klient");
	brukerDao.getOne(req.params.brukernavn, (status, data) => {
		res.status(status);
		res.json(data);
	});
});

app.get("/nyhetssaker/kategorier/MineSaker/:brukerId", (req, res) => {
	console.log("/nyhetssaker/:brukerId: Fikk GET-request fra klient");
	nyhetssakDao.getSakerBruker(req.params.brukerId, (status, data) => {
		res.status(status);
		res.json(data);
	});
});

app.get("/nyhetssaker/kategori/brukernavn/:id", (req, res) => {
	console.log("/nyhetssaker/brukernavn/:id: Fikk GET-request fra klient");
	nyhetssakDao.getForfatter(req.params.id, (status, data) => {
		res.status(status);
		res.json(data);
	});
});

app.get("/nyhetssaker/kategori/sokeSak/:overskrift", (req, res) => {
	console.log("/nyhetssaker/kategori/sokeSak/:overskrift: Fikk GET-request fra klient");
	nyhetssakDao.getSokSak(req.params.overskrift, (status, data) => {
		res.status(status);
		res.json(data);
	});
});