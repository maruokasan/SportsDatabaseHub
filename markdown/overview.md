# Product Requirements Document (PRD)

## 1. Project Overview
We are building a **Soccer Analytics & Management Web Application**. The system provides league-wide dashboards, team hubs, player profiles, match centres, and analytical tools for performance tracking, consistency analysis, head-to-head comparisons, and trend visualization.  

The application uses:
- **Frontend:** React.js
- **Styling:** Tailwind CSS
- **Backend:** Node.js with Express.js
- **Database:** SQLite (with the schema provided below)

This project meets the TIC2601 course requirements:
- ≥5 normalized tables (we have 7 core + 1 lookup).  
- Full CRUD support.  
- ≥10 analytical use-cases implemented with SQL queries.  
- Report, Demo video, and GitHub code repository.  

---

## 2. Database Schema

```sql
CREATE TABLE Team (
  TeamID      TEXT PRIMARY KEY,
  TeamName    TEXT NOT NULL,
  Country     TEXT
);

CREATE TABLE Player (
  PlayerID    TEXT PRIMARY KEY,
  FullName    TEXT NOT NULL,
  Age         INTEGER,
  Birthday    TEXT,
  Nationality TEXT,
  Experience  REAL,
  TeamID      TEXT REFERENCES Team(TeamID)
);

CREATE TABLE TournamentSeason (
  SeasonID        TEXT PRIMARY KEY,
  TournamentName  TEXT NOT NULL,
  Year            INTEGER NOT NULL
);

CREATE TABLE Match (
  MatchID       TEXT PRIMARY KEY,
  SeasonID      TEXT NOT NULL REFERENCES TournamentSeason(SeasonID),
  StartDateTime TEXT NOT NULL,
  EndDateTime   TEXT,
  Status        TEXT CHECK (Status IN ('Scheduled','Live','Completed','Postponed','Abandoned'))
);

CREATE TABLE MatchTeam (
  MatchTeamID INTEGER PRIMARY KEY AUTOINCREMENT,
  MatchID     TEXT NOT NULL REFERENCES Match(MatchID),
  TeamID      TEXT NOT NULL REFERENCES Team(TeamID),
  Role        TEXT CHECK (Role IN ('Home','Away'))
);

CREATE TABLE LookupScoreCategory (
  ScoreCategory TEXT PRIMARY KEY,
  Description   TEXT
);

CREATE TABLE PlayerMatchStats (
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
```

## 3. User Roles

**Public Users (View only)**
- Access dashboard with KPIs and analytics.
- Navigate to Matches, Teams, Players, Standings, Leaderboards, H2H, and Analytics.

**Admins (Login required)**
- Full CRUD on Teams, Players, Matches, Seasons.
- Edit PlayerMatchStats (match results).
- Manage LookupScoreCategory.
- Import CSV (bulk insert/validate).
- View ERD and system logs.

## 4. Core Features & Pages

**4.1 Dashboard (Home)**
- Live/Upcoming Matches (status filter).
- Standings mini-table (Pts, GD, Form).
- Top Scorers / Top Assists (season).
- Form Guide (last 5 matches).
- League Trend (goals per month line chart).
- H2H Quick Compare (Team A vs Team B).
- Shortcuts → Player Consistency, Age Bands, Heatmap, Milestones.

**4.2 Matches**
- Fixtures/Results list with filters (status/date/season).
- Match Centre: Teams, Player stats, totals from PlayerMatchStats, trivia.

**4.3 Teams**
- Teams list (name, country).
- Team Hub: roster (players), KPIs (win rate, goals for/against), recent fixtures, top scorers in team, H2H launcher.

**4.4 Players**
- Accessible from Team Hub.
- Player Profile:
  - Bio (Name, Age, Nationality, Team, Experience).
  - Career totals (Matches, Goals, Assists, WinRate).
  - Timeline (goals/assists per match).
  - Workload tracker (minutes last 5 matches).
  - Consistency index (Avg + Variance).
  - Milestones (50 matches, 100 goals, etc.).
  - Vs Opponent performance.

**4.5 Standings**
- Full league table (computed from Match + PlayerMatchStats via v_TeamGoals).
- Columns: Team, P, W, D, L, GF, GA, GD, Pts, Form (last 5).

**4.6 Leaderboards**
- Top Scorers, Top Assists (with season filter, min appearances).

**4.7 Head-to-Head**
- Compare two teams: W/D/L summary, aggregate goals, list of past meetings.

**4.8 Analytics**
- Trends: seasonal/monthly scoring trends.
- Consistency: player avg score vs variance (HAVING filter).
- Nationality Heatmap: avg score by nationality.
- Age-Bands: compare ≤20, 21–24, 25–28, 29+.
- Milestones: player thresholds (matches, goals).

**4.9 Browser/Status**
- Quick search of matches by status/date with integrity check (EndDate > StartDate).

**4.10 Admin**
- CRUD: Teams, Players, Matches, Seasons, MatchTeam, PlayerMatchStats.
- Lookup: ScoreCategory.
- CSV Import: validate + insert.
- ERD Viewer: static embed + notes.

## 5. API Endpoints (Node.js/Express)

**Public APIs**
- `/api/dashboard` → summary cards + charts.
- `/api/matches` → list with filters.
- `/api/matches/:id` → match details + stats.
- `/api/teams` → list all teams.
- `/api/teams/:id` → team hub (roster, stats).
- `/api/players/:id` → player profile.
- `/api/standings?seasonId=` → computed standings.
- `/api/leaderboards/top-scorers?seasonId=`
- `/api/leaderboards/top-assists?seasonId=`
- `/api/h2h?teamA=&teamB=`
- `/api/analytics/trends`
- `/api/analytics/consistency?minMatches=`
- `/api/analytics/heatmap?minSamples=`
- `/api/analytics/age-bands`
- `/api/analytics/milestones?playerId=…`

**Admin APIs**
- `/api/admin/login`
- `/api/admin/players`, `/api/admin/teams`, `/api/admin/matches`, `/api/admin/seasons`, `/api/admin/match-teams`, `/api/admin/player-match-stats` (CRUD).
- `/api/admin/lookups/score-category`
- `/api/admin/import`

## 6. Technical Requirements

**Frontend (React + Tailwind CSS)**
- React Router for page navigation.
- Tailwind CSS utility classes for rapid, responsive UI development.
- Components: DataGrid, KPI Cards, Charts (Recharts or Chart.js), Form inputs, File Upload.
- State management: React Query or Context API for API calls.
- Responsive design (desktop-first).

**Backend (Node.js + Express)**
- RESTful APIs with JSON responses.
- Database access via better-sqlite3 or sqlite3 npm package.
- Input validation & error handling.
- Session-based auth for Admin (simple).
- Views for heavy queries (v_TeamGoals, v_PlayerMatch).

**Database (SQLite)**
- Normalized tables (as defined).
- Indexes:
  ```sql
  CREATE INDEX idx_pms_player ON PlayerMatchStats(PlayerID);
  CREATE INDEX idx_pms_match ON PlayerMatchStats(MatchID);
  CREATE INDEX idx_match_season ON Match(SeasonID);
  CREATE INDEX idx_match_status ON Match(Status);
  ```
- Views:
  - v_TeamGoals for team totals per match.
  - v_PlayerMatch for common player–match join.

## 7. Success Criteria

- Implements ≥10 analytical use-cases (all 12 from proposal).
- Provides CRUD operations on ≥5 tables.
- Clean ERD + relational mapping documented.
- Frontend pages align to proposal use cases.
- Demo video: 2–3 mins from Dashboard → drill-downs → Admin edit → refresh KPIs.
- GitHub repo: clear folder structure, contribution logs.
---