const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'app.db');
const db = new Database(dbPath, { verbose: null });

// Pragmas = safer + faster dev defaults
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// ===== Schema (create-if-not-exists) =====
const schema = `
CREATE TABLE IF NOT EXISTS Team (
  TeamID      TEXT PRIMARY KEY,
  TeamName    TEXT NOT NULL,
  Country     TEXT
);

CREATE TABLE IF NOT EXISTS Player (
  PlayerID    TEXT PRIMARY KEY,
  FullName    TEXT NOT NULL,
  Age         INTEGER,
  Birthday    TEXT,              -- ISO 'YYYY-MM-DD'
  Nationality TEXT,
  Experience  REAL,
  TeamID      TEXT REFERENCES Team(TeamID)
);

CREATE TABLE IF NOT EXISTS TournamentSeason (
  SeasonID        TEXT PRIMARY KEY,
  TournamentName  TEXT NOT NULL,
  Year            INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Match (
  MatchID       TEXT PRIMARY KEY,
  SeasonID      TEXT NOT NULL REFERENCES TournamentSeason(SeasonID),
  StartDateTime TEXT NOT NULL,
  EndDateTime   TEXT,
  Status        TEXT CHECK (Status IN ('Scheduled','Live','Completed','Postponed','Abandoned'))
);

CREATE TABLE IF NOT EXISTS MatchTeam (
  MatchTeamID INTEGER PRIMARY KEY AUTOINCREMENT,
  MatchID     TEXT NOT NULL REFERENCES Match(MatchID),
  TeamID      TEXT NOT NULL REFERENCES Team(TeamID),
  Role        TEXT CHECK (Role IN ('Home','Away'))
);

CREATE TABLE IF NOT EXISTS LookupScoreCategory (
  ScoreCategory TEXT PRIMARY KEY,  -- 'A','B','C','D'
  Description   TEXT
);

CREATE TABLE IF NOT EXISTS PlayerMatchStats (
  PlayerID       TEXT NOT NULL REFERENCES Player(PlayerID),
  MatchID        TEXT NOT NULL REFERENCES Match(MatchID),
  MinutesPlayed  INTEGER DEFAULT 0,
  Score          INTEGER DEFAULT 0,
  Assists        INTEGER DEFAULT 0,
  Cards          INTEGER DEFAULT 0,
  DistanceRun    REAL,
  ScoreCategory  TEXT REFERENCES LookupScoreCategory(ScoreCategory),
  PRIMARY KEY (PlayerID, MatchID)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_player_team ON Player(TeamID);
CREATE INDEX IF NOT EXISTS idx_matchteam_match ON MatchTeam(MatchID);
CREATE INDEX IF NOT EXISTS idx_match_status ON Match(Status);
CREATE INDEX IF NOT EXISTS idx_pms_match ON PlayerMatchStats(MatchID);
`;
db.exec(schema);

// ===== Seed (idempotent) =====
const seed = () => {
  const seedScoreCats = db.prepare(`
    INSERT OR IGNORE INTO LookupScoreCategory (ScoreCategory, Description)
    VALUES (@ScoreCategory, @Description)
  `);
  ['A','B','C','D'].forEach((c) => {
    seedScoreCats.run({
      ScoreCategory: c,
      Description: ({A:'Top tier',B:'Strong',C:'Average',D:'Below average'})[c]
    });
  });

  // Example tiny seed so endpoints have something to read
  db.prepare(`INSERT OR IGNORE INTO Team (TeamID, TeamName, Country)
              VALUES ('T001','Lions FC','Singapore')`).run();

  db.prepare(`INSERT OR IGNORE INTO TournamentSeason (SeasonID, TournamentName, Year)
              VALUES ('S2025', 'Premier Cup', 2025)`).run();
};

seed();

module.exports = db;
