const Dao = require("./dao.js");

module.exports = class NyhetssakDao extends Dao {
    getAll(callback) {
        super.query(
            "SELECT saksId, overskrift, innhold, tidspunkt, bilde, kategori, viktighet, brukerId, rating FROM NYHETSSAK WHERE viktighet=1 ORDER BY rating DESC",
            [],
            callback
        );
    }

    getOneId(kategori, id, callback) {
        super.query(
            "SELECT saksId, overskrift, innhold, tidspunkt, bilde, kategori, viktighet, brukerId, rating FROM NYHETSSAK WHERE kategori=? AND saksId=?",
            [kategori, id],
            callback
        );
    }

    getKategori(kategori, callback) {
        super.query(
            "SELECT saksId, overskrift, innhold, tidspunkt, bilde, kategori, viktighet, brukerId, rating FROM NYHETSSAK WHERE kategori=? ORDER BY rating DESC",
            [kategori],
            callback
        );
    }

    createOne(json, callback) {
        super.query(
            "INSERT INTO NYHETSSAK (overskrift, innhold, tidspunkt, bilde, kategori, viktighet, rating, brukerId) VALUES (?, ?, NOW(), ?, ?, ?, 0, ?)",
            [json.overskrift, json.innhold, json.bilde, json.kategori, json.viktighet, json.brukerId],
            callback
        );
    }

    deleteOne(id, json, callback) {
        super.query(
            "DELETE FROM NYHETSSAK WHERE NYHETSSAK.saksId=? AND NYHETSSAK.brukerId=?",
            [id, json.brukerId],
            callback
        );
    }

    upvote(id, callback) {
        super.query(
            "UPDATE NYHETSSAK SET RATING = RATING + 1 WHERE NYHETSSAK.saksId=?",
            [id],
            callback
        );
    }

    getLivefeed(callback) {
        super.query(
            "SELECT overskrift FROM NYHETSSAK WHERE NYHETSSAK.viktighet=2 AND TIMESTAMPDIFF(MINUTE, NOW(), NYHETSSAK.tidspunkt) <= 60 ORDER BY NYHETSSAK.tidspunkt DESC LIMIT 5",
            [],
            callback
        );
    }
};