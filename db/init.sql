create table grilles (
    gid      serial            primary key,
    grille   char(81)          not null,
    knight   integer default 0 not null,
    king     integer default 0 not null,
    noseq    integer default 0 not null,
    thermo   text,
    arrow    text,
    sandwich text);

create table players (
    pid  serial      primary key,
    name varchar(32) not null,
    pass varchar(64));

create unique index players_name_uindex
    on players (name);

create table playedgrid (
    pgid serial            primary key,
    pid  integer not null  references players
            on update cascade on delete cascade,
    gid  integer not null references grilles
            on update cascade on delete cascade);

-- Normal Sudoku
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('7.4..6..9.8..1......3.2.45.........2.56...78.1.........25.3.1......4..6.9..5..3.7', 0, 0, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('6.5.....7...5..1...4...1..6..4.1..6....462....8..3.2..8..3...2...3..7...5.....7.4', 0, 0, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.....5.1.2..79.5....6..1.........63.7.56.29.4.34.........3..7....2.74..9.9.1.....', 0, 0, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.16...2389....417...............2.5..2.563.4..3.8...............617....2287...31.', 0, 0, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.....49..8...9..7..6.1....361.3....8..9.2..4......56....1.7.....7...24..4....1.8.', 0, 0, 0, null, null, null);
-- Knight Sudoku
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('..36.81...4.....7.2.......36...9...8...1.2...7...6...44.......1.6.....2...54.98..', 1, 0, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.....3....378.5.4......173.482....6...........7....518.469......2.1.687....4.....', 1, 0, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('......52...9...........71.........899..5.4..264.........47...........2...28......', 1, 0, 0, null, null, null);
-- King Sudoku
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.7...3.....9...5.7.1..7..2.8..2.5.....6...4.....9.8..5.5..3..4.2.1...8.....5...9.', 0, 1, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.....42.........4...48.297.73.65....8.......6....98.17.512.37...4.........71.....', 0, 1, 0, null, null, null);
INSERT INTO grilles (grille, knight, king, noseq, thermo, arrow, sandwich) VALUES ('.43.1.7.59716.........47..2......2.............9......7..18.........35794.6.5.81.', 0, 1, 0, null, null, null);
