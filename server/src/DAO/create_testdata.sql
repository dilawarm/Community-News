INSERT INTO BRUKER (brukerId, brukernavn, passord) VALUES
    (1, 'bruker', 'passord');

INSERT INTO NYHETSSAK (saksId, overskrift, innhold, tidspunkt, bilde, kategori, viktighet, rating, brukerId) VALUES
    (1, 'overskrift', 'innhold', NOW(), 'bilder/sak2.jpg', 'Nyheter', TRUE, 0, 1);

INSERT INTO KOMMENTAR (kommId, kommentar, saksId, nick) VALUES
    (1, 'kommentar', 1, 'bruker');