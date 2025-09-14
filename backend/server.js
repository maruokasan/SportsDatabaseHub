const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors()); // allow React dev server to call APIs during dev

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// ============ Teams ============
app.get('/api/teams', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM Team ORDER BY TeamName`).all();
  res.json(rows);
});

app.get('/api/teams/:id', (req, res) => {
  const row = db.prepare(`SELECT * FROM Team WHERE TeamID = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Team not found' });
  res.json(row);
});

app.post('/api/teams', (req, res) => {
  try {
    const { TeamID, TeamName, Country } = req.body;
    db.prepare(`INSERT INTO Team (TeamID, TeamName, Country) VALUES (?,?,?)`)
      .run(TeamID, TeamName, Country ?? null);
    res.status(201).json({ TeamID, TeamName, Country: Country ?? null });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ Players ============
app.get('/api/players', (_req, res) => {
  const rows = db.prepare(`
    SELECT p.*, t.TeamName
    FROM Player p LEFT JOIN Team t ON t.TeamID = p.TeamID
    ORDER BY p.FullName
  `).all();
  res.json(rows);
});

app.post('/api/players', (req, res) => {
  try {
    const { PlayerID, FullName, Age, Birthday, Nationality, Experience, TeamID } = req.body;
    db.prepare(`
      INSERT INTO Player (PlayerID, FullName, Age, Birthday, Nationality, Experience, TeamID)
      VALUES (?,?,?,?,?,?,?)
    `).run(PlayerID, FullName, Age ?? null, Birthday ?? null, Nationality ?? null, Experience ?? null, TeamID ?? null);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ Seasons ============
app.get('/api/seasons', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM TournamentSeason ORDER BY Year DESC, TournamentName`).all();
  res.json(rows);
});

app.post('/api/seasons', (req, res) => {
  try {
    const { SeasonID, TournamentName, Year } = req.body;
    db.prepare(`
      INSERT INTO TournamentSeason (SeasonID, TournamentName, Year)
      VALUES (?,?,?)
    `).run(SeasonID, TournamentName, Year);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ Matches ============
app.get('/api/matches', (_req, res) => {
  const rows = db.prepare(`
    SELECT m.*, s.TournamentName, s.Year
    FROM Match m JOIN TournamentSeason s ON s.SeasonID = m.SeasonID
    ORDER BY m.StartDateTime DESC
  `).all();
  res.json(rows);
});

app.post('/api/matches', (req, res) => {
  try {
    const { MatchID, SeasonID, StartDateTime, EndDateTime, Status } = req.body;
    db.prepare(`
      INSERT INTO Match (MatchID, SeasonID, StartDateTime, EndDateTime, Status)
      VALUES (?,?,?,?,?)
    `).run(MatchID, SeasonID, StartDateTime, EndDateTime ?? null, Status);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ Match Teams ============
app.get('/api/matches/:matchId/teams', (req, res) => {
  const rows = db.prepare(`
    SELECT mt.MatchTeamID, mt.Role, t.TeamID, t.TeamName
    FROM MatchTeam mt
    JOIN Team t ON t.TeamID = mt.TeamID
    WHERE mt.MatchID = ?
    ORDER BY mt.Role
  `).all(req.params.matchId);
  res.json(rows);
});

app.post('/api/matches/:matchId/teams', (req, res) => {
  try {
    const { TeamID, Role } = req.body;
    const info = db.prepare(`
      INSERT INTO MatchTeam (MatchID, TeamID, Role)
      VALUES (?,?,?)
    `).run(req.params.matchId, TeamID, Role);
    res.status(201).json({ MatchTeamID: info.lastInsertRowid, MatchID: req.params.matchId, TeamID, Role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ Lookup Score Categories ============
app.get('/api/score-categories', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM LookupScoreCategory ORDER BY ScoreCategory`).all();
  res.json(rows);
});

app.post('/api/score-categories', (req, res) => {
  try {
    const { ScoreCategory, Description } = req.body;
    db.prepare(`INSERT INTO LookupScoreCategory (ScoreCategory, Description) VALUES (?,?)`)
      .run(ScoreCategory, Description ?? null);
    res.status(201).json(req.body);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ Player Match Stats ============
app.get('/api/matches/:matchId/stats', (req, res) => {
  const rows = db.prepare(`
    SELECT pms.*, p.FullName, p.TeamID
    FROM PlayerMatchStats pms
    JOIN Player p ON p.PlayerID = pms.PlayerID
    WHERE pms.MatchID = ?
    ORDER BY p.FullName
  `).all(req.params.matchId);
  res.json(rows);
});

app.post('/api/matches/:matchId/stats', (req, res) => {
  try {
    const { PlayerID, MinutesPlayed = 0, Score = 0, Assists = 0, Cards = 0, DistanceRun = null, ScoreCategory = null } = req.body;
    db.prepare(`
      INSERT INTO PlayerMatchStats (PlayerID, MatchID, MinutesPlayed, Score, Assists, Cards, DistanceRun, ScoreCategory)
      VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(PlayerID, MatchID) DO UPDATE SET
        MinutesPlayed=excluded.MinutesPlayed,
        Score=excluded.Score,
        Assists=excluded.Assists,
        Cards=excluded.Cards,
        DistanceRun=excluded.DistanceRun,
        ScoreCategory=excluded.ScoreCategory
    `).run(PlayerID, req.params.matchId, MinutesPlayed, Score, Assists, Cards, DistanceRun, ScoreCategory);
    res.status(201).json({ PlayerID, MatchID: req.params.matchId, MinutesPlayed, Score, Assists, Cards, DistanceRun, ScoreCategory });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/*
  ---------- DASHBOARD ENDPOINT ----------
  Returns: { liveUpcoming, standingsMini, topScorers, topAssists, trend }
*/
app.get('/api/dashboard', (req, res) => {
  try {
    // Live/Upcoming (next 5)
    const liveUpcoming = db.prepare(`
      SELECT m.MatchID, m.StartDateTime, m.Status,
             ht.TeamName AS HomeTeam, at.TeamName AS AwayTeam
      FROM Match m
      JOIN MatchTeam hm ON hm.MatchID = m.MatchID AND hm.Role = 'Home'
      JOIN Team ht ON ht.TeamID = hm.TeamID
      JOIN MatchTeam am ON am.MatchID = m.MatchID AND am.Role = 'Away'
      JOIN Team at ON at.TeamID = am.TeamID
      WHERE m.Status IN ('Scheduled','Live')
      ORDER BY m.Status = 'Live' DESC, datetime(m.StartDateTime) ASC
      LIMIT 5
    `).all();

    // Standings mini-table (Pts, GD, Form) — quick compute from results
    // Assumes goals come from PlayerMatchStats.Score aggregated per team/match
    const teamRows = db.prepare(`
      WITH TeamGoals AS (
        SELECT mt.TeamID, m.MatchID,
               SUM(COALESCE(pms.Score,0)) AS Goals
        FROM Match m
        JOIN MatchTeam mt ON mt.MatchID = m.MatchID
        LEFT JOIN PlayerMatchStats pms ON pms.MatchID = m.MatchID
          AND pms.PlayerID IN (SELECT PlayerID FROM Player WHERE TeamID = mt.TeamID)
        WHERE m.Status = 'Completed'
        GROUP BY mt.TeamID, m.MatchID
      ),
      Results AS (
        SELECT h.TeamID AS HomeTeam, a.TeamID AS AwayTeam,
               hg.Goals AS HomeGoals, ag.Goals AS AwayGoals
        FROM (SELECT * FROM MatchTeam WHERE Role='Home') h
        JOIN (SELECT * FROM MatchTeam WHERE Role='Away') a ON a.MatchID = h.MatchID
        JOIN TeamGoals hg ON hg.MatchID = h.MatchID AND hg.TeamID = h.TeamID
        JOIN TeamGoals ag ON ag.MatchID = a.MatchID AND ag.TeamID = a.TeamID
      )
      SELECT
        t.TeamID, t.TeamName,
        SUM(CASE WHEN (HomeTeam = t.TeamID AND HomeGoals > AwayGoals) OR
                      (AwayTeam = t.TeamID AND AwayGoals > HomeGoals) THEN 3
                 WHEN HomeGoals = AwayGoals THEN 1 ELSE 0 END) AS Pts,
        SUM(CASE WHEN HomeTeam = t.TeamID THEN HomeGoals
                 WHEN AwayTeam = t.TeamID THEN AwayGoals END) -
        SUM(CASE WHEN HomeTeam = t.TeamID THEN AwayGoals
                 WHEN AwayTeam = t.TeamID THEN HomeGoals END) AS GD
      FROM Team t
      LEFT JOIN Results r ON r.HomeTeam = t.TeamID OR r.AwayTeam = t.TeamID
      GROUP BY t.TeamID, t.TeamName
      ORDER BY Pts DESC, GD DESC, t.TeamName ASC
      LIMIT 5
    `).all();

    // Form (last 5 results per team) — compact W/D/L string
    const formStmt = db.prepare(`
      WITH RG AS (
        SELECT r.*, datetime(m.StartDateTime) AS Kickoff
        FROM (
          SELECT h.MatchID AS MatchID,
                 h.TeamID AS HomeTeam, a.TeamID AS AwayTeam,
                 hg.Goals AS HomeGoals, ag.Goals AS AwayGoals
          FROM (SELECT * FROM MatchTeam WHERE Role='Home') h
          JOIN (SELECT * FROM MatchTeam WHERE Role='Away') a ON a.MatchID = h.MatchID
          JOIN (
            SELECT mt.TeamID, m.MatchID, SUM(COALESCE(pms.Score,0)) AS Goals
            FROM Match m
            JOIN MatchTeam mt ON mt.MatchID = m.MatchID
            LEFT JOIN PlayerMatchStats pms ON pms.MatchID = m.MatchID
              AND pms.PlayerID IN (SELECT PlayerID FROM Player WHERE TeamID = mt.TeamID)
            WHERE m.Status = 'Completed'
            GROUP BY mt.TeamID, m.MatchID
          ) hg ON hg.MatchID = h.MatchID AND hg.TeamID = h.TeamID
          JOIN (
            SELECT mt.TeamID, m.MatchID, SUM(COALESCE(pms.Score,0)) AS Goals
            FROM Match m
            JOIN MatchTeam mt ON mt.MatchID = m.MatchID
            LEFT JOIN PlayerMatchStats pms ON pms.MatchID = m.MatchID
              AND pms.PlayerID IN (SELECT PlayerID FROM Player WHERE TeamID = mt.TeamID)
            WHERE m.Status = 'Completed'
            GROUP BY mt.TeamID, m.MatchID
          ) ag ON ag.MatchID = a.MatchID AND ag.TeamID = a.TeamID
        ) r
        JOIN Match m ON m.MatchID = r.MatchID
      )
      SELECT t.TeamID,
             GROUP_CONCAT(res, '') AS Form
      FROM (
        SELECT TeamID,
               CASE
                 WHEN TeamID = HomeTeam AND HomeGoals > AwayGoals THEN 'W'
                 WHEN TeamID = AwayTeam AND AwayGoals > HomeGoals THEN 'W'
                 WHEN HomeGoals = AwayGoals THEN 'D'
                 ELSE 'L'
               END AS res, Kickoff
        FROM (
          SELECT HomeTeam, AwayTeam, HomeGoals, AwayGoals, Kickoff
          FROM RG
        ), (SELECT TeamID FROM Team)
        WHERE TeamID = HomeTeam OR TeamID = AwayTeam
        ORDER BY Kickoff DESC
        LIMIT 5
      ) x
      JOIN Team t ON t.TeamID = x.TeamID
      GROUP BY t.TeamID
    `);
    const formMap = new Map(formStmt.all().map(r => [r.TeamID, r.Form]));
    const standingsMini = teamRows.map(r => ({ ...r, Form: formMap.get(r.TeamID) || '' }));

    // Top scorers / assists (season-less quick view)
    const topScorers = db.prepare(`
      SELECT p.PlayerID, p.FullName, COALESCE(SUM(pms.Score),0) AS Goals
      FROM Player p
      LEFT JOIN PlayerMatchStats pms ON pms.PlayerID = p.PlayerID
      GROUP BY p.PlayerID, p.FullName
      ORDER BY Goals DESC, p.FullName ASC
      LIMIT 5
    `).all();

    const topAssists = db.prepare(`
      SELECT p.PlayerID, p.FullName, COALESCE(SUM(pms.Assists),0) AS Assists
      FROM Player p
      LEFT JOIN PlayerMatchStats pms ON pms.PlayerID = p.PlayerID
      GROUP BY p.PlayerID, p.FullName
      ORDER BY Assists DESC, p.FullName ASC
      LIMIT 5
    `).all();

    // Monthly scoring trend (goals per month)
    const trend = db.prepare(`
      SELECT strftime('%Y-%m', m.StartDateTime) AS ym,
             SUM(COALESCE(pms.Score,0)) AS Goals
      FROM Match m
      LEFT JOIN PlayerMatchStats pms ON pms.MatchID = m.MatchID
      WHERE m.Status = 'Completed'
      GROUP BY ym
      ORDER BY ym ASC
    `).all();

    res.json({ liveUpcoming, standingsMini, topScorers, topAssists, trend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
