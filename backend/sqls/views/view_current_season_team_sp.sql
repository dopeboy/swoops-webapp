DROP MATERIALIZED VIEW view_current_season_team_sp;
CREATE MATERIALIZED VIEW IF NOT EXISTS view_current_season_team_sp AS

/*GAME_CONTEST captures contest id, contest status, contest type, and when it was played.
For each contest id, GAME_GAME captures lineup 1 id, lineup 2 id, and prize pool amount.
GAME_LINEUP takes the lineup id from GAME_GAME and tells us the player ids in the lineup along with their team's id.
ACCOUNTS_USER gives us additional details of each team.
SIMULATION_SIMULATION provides the result id needed to find contest outcomes.
SIMULATION_RESULT shows contest results with ids for players' box scores.
GAME_TOURNAMENT provides details for each tournament.
GAME_TOURNAMENTENTRY displays the entry times, lineups, and seeds for each team.

--BASE QUERY
GAME_LEVEL_BASE (GLB) provides info on the contest level.

--PLAYERS
GAME_TEAM_BASE (GTB) UNIONS and consolidates team 1 and team 2 details from the contest level into agnostic team and lineup fields.
GAME_LINEUP_PREP (GLP) UNIONS and consolidates players from the lineup level into agnostic player fields while hardcoding their lineup slots.
SIM_LINEUP_PREP (SLP) UNIONS and consolidates lineup and player details from the contest level into agnostic lineup and player fields while
hardcoding their lineup slots, which are used to JOIN to GAME_LINEUP_PREP (GLP).
GAME_BOX_SCORE_PREP_WEEK_2 (GBSPW2) shows player details and box scores from each contest lineup for week 2.
GAME_BOX_SCORE_SUM_WEEK_2 (GBSSW2) shows aggregate player details from all games played for week 2.
GAME_BOX_SCORE_PREP_WEEK_3 (GBSPW3) shows player details and box scores from each contest lineup for week 3.
GAME_BOX_SCORE_SUM_WEEK_3 (GBSSW3) shows aggregate player details from all games played for week 3.
GAME_BOX_SCORE_PREP_WEEK_4 (GBSPW4) shows player details and box scores from each contest lineup for week 4.
GAME_BOX_SCORE_SUM_WEEK_4 (GBSSW4) shows aggregate player details from all games played for week 4.
GAME_BOX_SCORE_PREP_WEEK_5 (GBSPW5) shows player details and box scores from each contest lineup for week 5.
GAME_BOX_SCORE_SUM_WEEK_5 (GBSSW5) shows aggregate player details from all games played for week 5.
GAME_BOX_SCORE_PREP_WEEK_6 (GBSPW6) shows player details and box scores from each contest lineup for week 6.
GAME_BOX_SCORE_SUM_WEEK_6 (GBSSW6) shows aggregate player details from all games played for week 6.
GAME_BOX_SCORE_PREP_WEEK_8 (GBSPW8) shows player details and box scores from each contest lineup for week 8.
GAME_BOX_SCORE_SUM_WEEK_8 (GBSSW8) shows aggregate player details from all games played for week 8.
GAME_BOX_SCORE_PREP_WEEK_9 (GBSPW9) shows player details and box scores from each contest lineup for week 9.
GAME_BOX_SCORE_SUM_WEEK_9 (GBSSW9) shows aggregate player details from all games played for week 9.
GAME_BOX_SCORE_PREP_WEEK_10 (GBSPW10) shows player details and box scores from each contest lineup for week 10.
GAME_BOX_SCORE_SUM_WEEK_10 (GBSSW10) shows aggregate player details from all games played for week 10.
GAME_BOX_SCORE_PREP_WEEK_11 (GBSPW11) shows player details and box scores from each contest lineup for week 11.
GAME_BOX_SCORE_SUM_WEEK_11 (GBSSW11) shows aggregate player details from all games played for week 11.

--TEAMS
PLAYER_OWNER_DETAILS (POD) shows players' current team details.
TEAM_EARNINGS (TE) shows earnings by team.
LINEUP_PREP (LP) shows lineup details by team.
GAME_TEAM_FULL_LINEUPS (GTFL) normalizes all contest details at the individual team perspective.
TEAM_PLAYER_TOTALS_WEEK_2 (TPTW2) ranks aggregate player stats across the team for week 2.
TEAM_PLAYER_TOTALS_WEEK_4 (TPTW4) ranks aggregate player stats across the team for week 4.
TEAM_PLAYER_TOTALS_WEEK_6 (TPTW6) ranks aggregate player stats across the team for week 6.
TEAM_PLAYER_TOTALS_WEEK_8 (TPTW8) ranks aggregate player stats across the team for week 8.
TEAM_PLAYER_TOTALS_WEEK_10 (TPTW10) ranks aggregate player stats across the team for week 10.

--TOURNEYS
TOURNEY_TOP_64_BASE (TT64B) returns details for the top 64 teams in each tournament.
TOURNEY_SP_PREP (TSP) shows SP details for the top 64 teams in each tournament.
TOURNEY_SP_TOTALS (TST) shows aggregate SP at the team level.

--SWOOPER POINTS
GAME_TEAM_LEADERBOARD (GTL) aggregates and shows entries with XP by day.
TOTAL_TEAM_LEADERBOARD (TTL) shows total entries and daily XP on team level.
TEAM_LEADERBOARD_WEEK_1 (TLW1) shows total wins, entries, and matchmade entries on team level for week 1.
TEAM_LEADERBOARD_WEEK_2 (TLW2) shows total wins, entries, and matchmade entries on team level for week 2
TEAM_LEADERBOARD_WEEK_3 (TLW3) shows total wins, entries, and matchmade entries on team level for week 3.
TEAM_LEADERBOARD_WEEK_4 (TLW4) shows total wins, entries, and matchmade entries on team level for week 4.
TEAM_LEADERBOARD_WEEK_5 (TLW5) shows total wins, entries, and matchmade entries on team level for week 5.
TEAM_LEADERBOARD_WEEK_6 (TLW6) shows total wins, entries, and matchmade entries on team level for week 6.
TEAM_LEADERBOARD_WEEK_7 (TLW7) shows total wins, entries, and matchmade entries on team level for week 7.
TEAM_LEADERBOARD_WEEK_8 (TLW8) shows total wins, entries, and matchmade entries on team level for week 8.
TEAM_LEADERBOARD_WEEK_9 (TLW9) shows total wins, entries, and matchmade entries on team level for week 9.
TEAM_LEADERBOARD_WEEK_10 (TLW10) shows total wins, entries, and matchmade entries on team level for week 10.
TEAM_LEADERBOARD_WEEK_11 (TLW11) shows total wins, entries, and matchmade entries on team level for week 11.
ALL_WEEK_LEADERBOARD (AWL) shows wins, matchmade entries, and SP for each of weeks 1-11.
TOTAL_WEEK_LEADERBOARD (TWL) shows total wins, matchmade entries, and SP for weeks 1-11.
WEEKLY_CHALLENGE_1 (WC1) grants SP for a team surpassing 70 games played in week 1.
WEEKLY_CHALLENGE_2 (WC2) grants SP for a player surpassing 1,000 points in week 2.
WEEKLY_CHALLENGE_3 (WC3) grants SP for a team surpassing 250  blocks in week 3.
WEEKLY_CHALLENGE_4 (WC4) grants SP for a player surpassing 350 total rebounds in week 4.
WEEKLY_CHALLENGE_5 (WC5) grants SP for a team surpassing 1,750 assists played in week 5.
WEEKLY_CHALLENGE_6 (WC6) grants SP for a player surpassing 150 blocks in week 6.
WEEKLY_CHALLENGE_7 (WC7) grants SP for a team surpassing 100 games played in week 7.
WEEKLY_CHALLENGE_8 (WC8) grants SP for a player surpassing 650 assists in week 8.
WEEKLY_CHALLENGE_9 (WC9) grants SP for a team surpassing 500 steals in week 9.
WEEKLY_CHALLENGE_10 (WC10) grants SP for a player surpassing 350 3 pointers made in week 10.
WEEKLY_CHALLENGE_11 (WC11) grants SP for a team surpassing 7,500 points in week 11.

--MAIN QUERY
The main query aggregates stats at the team level.

IMPORTANT NOTE: Game id reflects the order of when a contest was created rather than when a contest was completed. Created at tells us
the timestamp (and order) of completed games*/

/*BASE QUERY*/
WITH game_level_base
AS (
	SELECT DISTINCT gg.id AS game_id
		,gg.contest_id
		,gt.id AS tourney_id
		,gt.kind AS tourney_kind
		,gt.name AS tourney_name
		,(gt.lineup_submission_cutoff - INTERVAL '4 hours')::DATE AS tourney_date
		,gt.size AS tourney_size
		,gt.payout AS tourney_payout
		,(ss.created_at - INTERVAL '4 hours') AS created_at
		--,(gc.played_at - INTERVAL '4 hours') AS played_at
		,gg.simulation_id
		,gc.kind AS game_kind
		,gc.tokens_required
		,ss.result_id
		,gg.prize_pool
		,gg.lineup_1_id
		,gg.lineup_2_id
		,sr.lineup_1_score
		,sr.lineup_2_score
		,gt.meta
	FROM game_game gg
	INNER JOIN game_contest gc ON gg.contest_id = gc.id
	INNER JOIN simulator_simulation ss ON gg.simulation_id = ss.id
	INNER JOIN simulator_result sr ON ss.result_id = sr.id
	LEFT JOIN game_tournament gt ON gc.id = gt.contest_id
	LEFT JOIN game_tournamententry gte ON gt.id = gte.tournament_id
	WHERE (ss.created_at - INTERVAL '4 hours') BETWEEN 'August 21, 2023 1:05 PM'
	    AND 'November 5, 2023 11:59 PM'
		AND (ss.created_at - INTERVAL '4 hours')::DATE <= NOW()
		/*'January 6, 2023 1:00 PM' 'May 31, 2023 1:00 PM'*/
		--AND ((ss.created_at - INTERVAL '4 hours')::DATE) <= ((CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE - 1)
		/*BETWEEN ((CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE - 7)
			AND ((CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE - 1)*/
		AND gc.status = 'COMPLETE'
		--AND gc.kind = 'TOURNAMENT' --NOT IN ('HEAD_TO_HEAD', 'HEAD_TO_HEAD_MATCH_MAKE')
		AND gg.visibility = 'PUBLIC'
		--AND gc.tokens_required = 5
		--AND gt.id = ?
	)
/*GAME_LEVEL_BASE (GLB) provides info on the contest level.*/
/*PLAYERS*/
	,game_team_base
AS (
	(
		SELECT glb.game_id
			,glb.contest_id
			,glb.tourney_id
			,glb.tourney_kind
			,glb.tourney_name
			,glb.tourney_date
			,glb.tourney_size
			,glb.tourney_payout
			,glb.created_at
			--,glb.played_at
			,glb.simulation_id
			,glb.game_kind
			,glb.tokens_required
			,glb.result_id
			,glb.prize_pool
			,glb.lineup_1_id AS lineup_id
			,glb.lineup_1_score AS own_score
			,glb.lineup_2_score AS opponent_score
			,glb.meta
			,CONCAT (
				'https://app.playswoops.com/tournament/'
				,glb.tourney_id
				) AS tourney_url
		FROM game_level_base glb
		)
	
	UNION ALL
	
	(
		SELECT glb.game_id
			,glb.contest_id
			,glb.tourney_id
			,glb.tourney_kind
			,glb.tourney_name
			,glb.tourney_date
			,glb.tourney_size
			,glb.tourney_payout
			,glb.created_at
			--,glb.played_at
			,glb.simulation_id
			,glb.game_kind
			,glb.tokens_required
			,glb.result_id
			,glb.prize_pool
			,glb.lineup_2_id AS lineup_id
			,glb.lineup_2_score AS own_score
			,glb.lineup_1_score AS opponent_score
			,glb.meta
			,CONCAT (
				'https://app.playswoops.com/tournament/'
				,glb.tourney_id
				) AS tourney_url
		FROM game_level_base glb
		)
	)
/*GAME_TEAM_BASE (GTB) UNIONS and consolidates team 1 and team 2 details from the contest level into agnostic team and lineup fields.*/
	,game_lineup_prep
AS (
	(
		SELECT gl.id
			,gl.team_id
			,gl.player_1_id AS player_id
			,1 AS lineup_spot
		FROM game_lineup gl
		)
	
	UNION ALL
	
	(
		SELECT gl.id
			,gl.team_id
			,gl.player_2_id AS player_id
			,2 AS lineup_spot
		FROM game_lineup gl
		)
	
	UNION ALL
	
	(
		SELECT gl.id
			,gl.team_id
			,gl.player_3_id AS player_id
			,3 AS lineup_spot
		FROM game_lineup gl
		)
	
	UNION ALL
	
	(
		SELECT gl.id
			,gl.team_id
			,gl.player_4_id AS player_id
			,4 AS lineup_spot
		FROM game_lineup gl
		)
	
	UNION ALL
	
	(
		SELECT gl.id
			,gl.team_id
			,gl.player_5_id AS player_id
			,5 AS lineup_spot
		FROM game_lineup gl
		)
	)
/*GAME_LINEUP_PREP (GLP) UNIONS and consolidates players from the lineup level into agnostic player fields while hardcoding their lineup slots.*/
	,sim_lineup_prep
AS (
	(
		SELECT sr.id
			,sr.lineup_1_score AS lineup_score
			,sr.lineup_1_box_score_id AS lineup_box_score_id
			,sr.lineup_1_player_1_box_score_id AS player_box_score_id
			,1 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_1_score AS lineup_score
			,sr.lineup_1_box_score_id AS lineup_box_score_id
			,sr.lineup_1_player_2_box_score_id AS player_box_score_id
			,2 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_1_score AS lineup_score
			,sr.lineup_1_box_score_id AS lineup_box_score_id
			,sr.lineup_1_player_3_box_score_id AS player_box_score_id
			,3 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_1_score AS lineup_score
			,sr.lineup_1_box_score_id AS lineup_box_score_id
			,sr.lineup_1_player_4_box_score_id AS player_box_score_id
			,4 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_1_score AS lineup_score
			,sr.lineup_1_box_score_id AS lineup_box_score_id
			,sr.lineup_1_player_5_box_score_id AS player_box_score_id
			,5 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_2_score AS lineup_score
			,sr.lineup_2_box_score_id AS lineup_box_score_id
			,sr.lineup_2_player_1_box_score_id AS player_box_score_id
			,1 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_2_score AS lineup_score
			,sr.lineup_2_box_score_id AS lineup_box_score_id
			,sr.lineup_2_player_2_box_score_id AS player_box_score_id
			,2 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_2_score AS lineup_score
			,sr.lineup_2_box_score_id AS lineup_box_score_id
			,sr.lineup_2_player_3_box_score_id AS player_box_score_id
			,3 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_2_score AS lineup_score
			,sr.lineup_2_box_score_id AS lineup_box_score_id
			,sr.lineup_2_player_4_box_score_id AS player_box_score_id
			,4 AS lineup_spot
		FROM simulator_result sr
		)
	
	UNION ALL
	
	(
		SELECT sr.id
			,sr.lineup_2_score AS lineup_score
			,sr.lineup_2_box_score_id AS lineup_box_score_id
			,sr.lineup_2_player_5_box_score_id AS player_box_score_id
			,5 AS lineup_spot
		FROM simulator_result sr
		)
	)
/*SIM_LINEUP_PREP (SLP) UNIONS and consolidates lineup and player details from the contest level into agnostic lineup
and player fields while hardcoding their lineup slots, which are used to JOIN to GAME_LINEUP_PREP (GLP).*/
	,game_box_score_prep_week_2
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
	--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'August 28, 2023'
		AND 'September 3, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_2 (GBSPW2) shows player details and box scores from each contest lineup for week 2.*/
	,game_box_score_sum_week_2
AS (
	SELECT gbspw2.team_id
		/*,gbspw2.tokens_required*/
		,gbspw2.player_id
		,gbspw2.token
		,gbspw2.full_name
		,gbspw2.canonical
		,gbspw2.positions
		,gbspw2.age
		,gbspw2.star_rating
		,COUNT(DISTINCT gbspw2.game_id) AS games_played
		,SUM(gbspw2.wins)/5 AS wins
		,COUNT(DISTINCT gbspw2.game_id) - SUM(gbspw2.wins)/5 AS losses
		,SUM(gbspw2.pts) AS total_pts
		,SUM(gbspw2.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw2.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw2.fg) AS total_fg
		,SUM(gbspw2.fga) AS total_fga
		,SUM(gbspw2.fg) / NULLIF(CAST(SUM(gbspw2.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw2.two_p) AS total_two_p
		,SUM(gbspw2.two_pa) AS total_two_pa
		,SUM(gbspw2.two_p) / NULLIF(CAST(SUM(gbspw2.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw2.three_p) AS total_three_p
		,SUM(gbspw2.three_pa) AS total_three_pa
		,SUM(gbspw2.three_p) / NULLIF(CAST(SUM(gbspw2.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw2.ft) AS total_ft
		,SUM(gbspw2.fta) AS total_fta
		,SUM(gbspw2.ft) / NULLIF(CAST(SUM(gbspw2.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw2.orb) AS total_orb
		,SUM(gbspw2.drb) AS total_drb
		,SUM(gbspw2.trb) AS total_trb
		,SUM(gbspw2.ast) AS total_ast
		,SUM(gbspw2.stl) AS total_stl
		,SUM(gbspw2.blk) AS total_blk
		,SUM(gbspw2.tov) AS total_tov
		,SUM(gbspw2.pf) AS total_pf
		,SUM(gbspw2.pts) / NULLIF(CAST(2 * (SUM(gbspw2.fga) + (0.44 * SUM(gbspw2.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw2.fg) + (0.5 * SUM(gbspw2.three_p))) / NULLIF(CAST(SUM(gbspw2.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw2.pts) + (0.4 * SUM(gbspw2.fg)) - (0.7 * SUM(gbspw2.fga)) - (0.4 * (SUM(gbspw2.fta) - SUM(gbspw2.ft))) + (0.7 * SUM(gbspw2.orb)) + (0.3 * SUM(gbspw2.drb)) + (0.7 * SUM(gbspw2.ast)) + SUM(gbspw2.stl) + (0.7 * SUM(gbspw2.blk)) - SUM(gbspw2.tov) - (0.4 * SUM(gbspw2.pf)) AS game_score
	FROM game_box_score_prep_week_2 gbspw2
	GROUP BY gbspw2.team_id
		/*,gbspw2.tokens_required*/
		,gbspw2.player_id
		,gbspw2.token
		,gbspw2.full_name
		,gbspw2.canonical
		,gbspw2.positions
		,gbspw2.age
		,gbspw2.star_rating
	ORDER BY /*gbspw2.token
		,*/gbspw2.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_2 (GBSSW2) shows aggregate player details from all games played for week 2.*/
	,game_box_score_prep_week_3
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
		--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'September 4, 2023'
	    AND 'September 10, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_3 (GBSPW3) shows player details and box scores from each contest lineup for week 3.*/
	,game_box_score_sum_week_3
AS (
	SELECT gbspw3.team_id
		/*,gbspw3.tokens_required
		,gbspw3.player_id
		,gbspw3.token
		,gbspw3.full_name
		,gbspw3.canonical
		,gbspw3.positions
		,gbspw3.age
		,gbspw3.star_rating*/
		,COUNT(DISTINCT gbspw3.game_id) AS games_played
		,SUM(gbspw3.wins)/5 AS wins
		,COUNT(DISTINCT gbspw3.game_id) - SUM(gbspw3.wins)/5 AS losses
		,SUM(gbspw3.pts) AS total_pts
		,SUM(gbspw3.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw3.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw3.fg) AS total_fg
		,SUM(gbspw3.fga) AS total_fga
		,SUM(gbspw3.fg) / NULLIF(CAST(SUM(gbspw3.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw3.two_p) AS total_two_p
		,SUM(gbspw3.two_pa) AS total_two_pa
		,SUM(gbspw3.two_p) / NULLIF(CAST(SUM(gbspw3.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw3.three_p) AS total_three_p
		,SUM(gbspw3.three_pa) AS total_three_pa
		,SUM(gbspw3.three_p) / NULLIF(CAST(SUM(gbspw3.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw3.ft) AS total_ft
		,SUM(gbspw3.fta) AS total_fta
		,SUM(gbspw3.ft) / NULLIF(CAST(SUM(gbspw3.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw3.orb) AS total_orb
		,SUM(gbspw3.drb) AS total_drb
		,SUM(gbspw3.trb) AS total_trb
		,SUM(gbspw3.ast) AS total_ast
		,SUM(gbspw3.stl) AS total_stl
		,SUM(gbspw3.blk) AS total_blk
		,SUM(gbspw3.tov) AS total_tov
		,SUM(gbspw3.pf) AS total_pf
		,SUM(gbspw3.pts) / NULLIF(CAST(2 * (SUM(gbspw3.fga) + (0.44 * SUM(gbspw3.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw3.fg) + (0.5 * SUM(gbspw3.three_p))) / NULLIF(CAST(SUM(gbspw3.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw3.pts) + (0.4 * SUM(gbspw3.fg)) - (0.7 * SUM(gbspw3.fga)) - (0.4 * (SUM(gbspw3.fta) - SUM(gbspw3.ft))) + (0.7 * SUM(gbspw3.orb)) + (0.3 * SUM(gbspw3.drb)) + (0.7 * SUM(gbspw3.ast)) + SUM(gbspw3.stl) + (0.7 * SUM(gbspw3.blk)) - SUM(gbspw3.tov) - (0.4 * SUM(gbspw3.pf)) AS game_score
	FROM game_box_score_prep_week_3 gbspw3
	GROUP BY gbspw3.team_id
		/*,gbspw3.tokens_required
		,gbspw3.player_id
		,gbspw3.token
		,gbspw3.full_name
		,gbspw3.canonical
		,gbspw3.positions
		,gbspw3.age
		,gbspw3.star_rating*/
	ORDER BY /*gbspw3.token
		,*/gbspw3.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_3 (GBSSW3) shows aggregate player details from all games played for week 3.*/
	,game_box_score_prep_week_4
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
	--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'September 11, 2023'
		AND 'September 17, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_4 (GBSPW4) shows player details and box scores from each contest lineup for week 4.*/
	,game_box_score_sum_week_4
AS (
	SELECT gbspw4.team_id
		/*,gbspw4.tokens_required*/
		,gbspw4.player_id
		,gbspw4.token
		,gbspw4.full_name
		,gbspw4.canonical
		,gbspw4.positions
		,gbspw4.age
		,gbspw4.star_rating
		,COUNT(DISTINCT gbspw4.game_id) AS games_played
		,SUM(gbspw4.wins)/5 AS wins
		,COUNT(DISTINCT gbspw4.game_id) - SUM(gbspw4.wins)/5 AS losses
		,SUM(gbspw4.pts) AS total_pts
		,SUM(gbspw4.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw4.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw4.fg) AS total_fg
		,SUM(gbspw4.fga) AS total_fga
		,SUM(gbspw4.fg) / NULLIF(CAST(SUM(gbspw4.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw4.two_p) AS total_two_p
		,SUM(gbspw4.two_pa) AS total_two_pa
		,SUM(gbspw4.two_p) / NULLIF(CAST(SUM(gbspw4.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw4.three_p) AS total_three_p
		,SUM(gbspw4.three_pa) AS total_three_pa
		,SUM(gbspw4.three_p) / NULLIF(CAST(SUM(gbspw4.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw4.ft) AS total_ft
		,SUM(gbspw4.fta) AS total_fta
		,SUM(gbspw4.ft) / NULLIF(CAST(SUM(gbspw4.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw4.orb) AS total_orb
		,SUM(gbspw4.drb) AS total_drb
		,SUM(gbspw4.trb) AS total_trb
		,SUM(gbspw4.ast) AS total_ast
		,SUM(gbspw4.stl) AS total_stl
		,SUM(gbspw4.blk) AS total_blk
		,SUM(gbspw4.tov) AS total_tov
		,SUM(gbspw4.pf) AS total_pf
		,SUM(gbspw4.pts) / NULLIF(CAST(2 * (SUM(gbspw4.fga) + (0.44 * SUM(gbspw4.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw4.fg) + (0.5 * SUM(gbspw4.three_p))) / NULLIF(CAST(SUM(gbspw4.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw4.pts) + (0.4 * SUM(gbspw4.fg)) - (0.7 * SUM(gbspw4.fga)) - (0.4 * (SUM(gbspw4.fta) - SUM(gbspw4.ft))) + (0.7 * SUM(gbspw4.orb)) + (0.3 * SUM(gbspw4.drb)) + (0.7 * SUM(gbspw4.ast)) + SUM(gbspw4.stl) + (0.7 * SUM(gbspw4.blk)) - SUM(gbspw4.tov) - (0.4 * SUM(gbspw4.pf)) AS game_score
	FROM game_box_score_prep_week_4 gbspw4
	GROUP BY gbspw4.team_id
		/*,gbspw4.tokens_required*/
		,gbspw4.player_id
		,gbspw4.token
		,gbspw4.full_name
		,gbspw4.canonical
		,gbspw4.positions
		,gbspw4.age
		,gbspw4.star_rating
	ORDER BY /*gbspw4.token
		,*/gbspw4.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_4 (GBSSW4) shows aggregate player details from all games played for week 4.*/
	,game_box_score_prep_week_5
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
		--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'September 18, 2023'
		AND 'September 24, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_5 (GBSPW5) shows player details and box scores from each contest lineup for week 5.*/
	,game_box_score_sum_week_5
AS (
	SELECT gbspw5.team_id
		/*,gbspw5.tokens_required
		,gbspw5.player_id
		,gbspw5.token
		,gbspw5.full_name
		,gbspw5.canonical
		,gbspw5.positions
		,gbspw5.age
		,gbspw5.star_rating*/
		,COUNT(DISTINCT gbspw5.game_id) AS games_played
		,SUM(gbspw5.wins)/5 AS wins
		,COUNT(DISTINCT gbspw5.game_id) - SUM(gbspw5.wins)/5 AS losses
		,SUM(gbspw5.pts) AS total_pts
		,SUM(gbspw5.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw5.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw5.fg) AS total_fg
		,SUM(gbspw5.fga) AS total_fga
		,SUM(gbspw5.fg) / NULLIF(CAST(SUM(gbspw5.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw5.two_p) AS total_two_p
		,SUM(gbspw5.two_pa) AS total_two_pa
		,SUM(gbspw5.two_p) / NULLIF(CAST(SUM(gbspw5.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw5.three_p) AS total_three_p
		,SUM(gbspw5.three_pa) AS total_three_pa
		,SUM(gbspw5.three_p) / NULLIF(CAST(SUM(gbspw5.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw5.ft) AS total_ft
		,SUM(gbspw5.fta) AS total_fta
		,SUM(gbspw5.ft) / NULLIF(CAST(SUM(gbspw5.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw5.orb) AS total_orb
		,SUM(gbspw5.drb) AS total_drb
		,SUM(gbspw5.trb) AS total_trb
		,SUM(gbspw5.ast) AS total_ast
		,SUM(gbspw5.stl) AS total_stl
		,SUM(gbspw5.blk) AS total_blk
		,SUM(gbspw5.tov) AS total_tov
		,SUM(gbspw5.pf) AS total_pf
		,SUM(gbspw5.pts) / NULLIF(CAST(2 * (SUM(gbspw5.fga) + (0.44 * SUM(gbspw5.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw5.fg) + (0.5 * SUM(gbspw5.three_p))) / NULLIF(CAST(SUM(gbspw5.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw5.pts) + (0.4 * SUM(gbspw5.fg)) - (0.7 * SUM(gbspw5.fga)) - (0.4 * (SUM(gbspw5.fta) - SUM(gbspw5.ft))) + (0.7 * SUM(gbspw5.orb)) + (0.3 * SUM(gbspw5.drb)) + (0.7 * SUM(gbspw5.ast)) + SUM(gbspw5.stl) + (0.7 * SUM(gbspw5.blk)) - SUM(gbspw5.tov) - (0.4 * SUM(gbspw5.pf)) AS game_score
	FROM game_box_score_prep_week_5 gbspw5
	GROUP BY gbspw5.team_id
		/*,gbspw5.tokens_required
		,gbspw5.player_id
		,gbspw5.token
		,gbspw5.full_name
		,gbspw5.canonical
		,gbspw5.positions
		,gbspw5.age
		,gbspw5.star_rating*/
	ORDER BY /*gbspw5.token
		,*/gbspw5.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_5 (GBSSW5) shows aggregate player details from all games played for week 5.*/
	,game_box_score_prep_week_6
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
	--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'September 25, 2023'
		AND 'October 1, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_6 (GBSPW6) shows player details and box scores from each contest lineup for week 6.*/
	,game_box_score_sum_week_6
AS (
	SELECT gbspw6.team_id
		/*,gbspw6.tokens_required*/
		,gbspw6.player_id
		,gbspw6.token
		,gbspw6.full_name
		,gbspw6.canonical
		,gbspw6.positions
		,gbspw6.age
		,gbspw6.star_rating
		,COUNT(DISTINCT gbspw6.game_id) AS games_played
		,SUM(gbspw6.wins)/5 AS wins
		,COUNT(DISTINCT gbspw6.game_id) - SUM(gbspw6.wins)/5 AS losses
		,SUM(gbspw6.pts) AS total_pts
		,SUM(gbspw6.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw6.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw6.fg) AS total_fg
		,SUM(gbspw6.fga) AS total_fga
		,SUM(gbspw6.fg) / NULLIF(CAST(SUM(gbspw6.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw6.two_p) AS total_two_p
		,SUM(gbspw6.two_pa) AS total_two_pa
		,SUM(gbspw6.two_p) / NULLIF(CAST(SUM(gbspw6.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw6.three_p) AS total_three_p
		,SUM(gbspw6.three_pa) AS total_three_pa
		,SUM(gbspw6.three_p) / NULLIF(CAST(SUM(gbspw6.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw6.ft) AS total_ft
		,SUM(gbspw6.fta) AS total_fta
		,SUM(gbspw6.ft) / NULLIF(CAST(SUM(gbspw6.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw6.orb) AS total_orb
		,SUM(gbspw6.drb) AS total_drb
		,SUM(gbspw6.trb) AS total_trb
		,SUM(gbspw6.ast) AS total_ast
		,SUM(gbspw6.stl) AS total_stl
		,SUM(gbspw6.blk) AS total_blk
		,SUM(gbspw6.tov) AS total_tov
		,SUM(gbspw6.pf) AS total_pf
		,SUM(gbspw6.pts) / NULLIF(CAST(2 * (SUM(gbspw6.fga) + (0.44 * SUM(gbspw6.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw6.fg) + (0.5 * SUM(gbspw6.three_p))) / NULLIF(CAST(SUM(gbspw6.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw6.pts) + (0.4 * SUM(gbspw6.fg)) - (0.7 * SUM(gbspw6.fga)) - (0.4 * (SUM(gbspw6.fta) - SUM(gbspw6.ft))) + (0.7 * SUM(gbspw6.orb)) + (0.3 * SUM(gbspw6.drb)) + (0.7 * SUM(gbspw6.ast)) + SUM(gbspw6.stl) + (0.7 * SUM(gbspw6.blk)) - SUM(gbspw6.tov) - (0.4 * SUM(gbspw6.pf)) AS game_score
	FROM game_box_score_prep_week_6 gbspw6
	GROUP BY gbspw6.team_id
		/*,gbspw6.tokens_required*/
		,gbspw6.player_id
		,gbspw6.token
		,gbspw6.full_name
		,gbspw6.canonical
		,gbspw6.positions
		,gbspw6.age
		,gbspw6.star_rating
	ORDER BY /*gbspw6.token
		,*/gbspw6.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_6 (GBSSW6) shows aggregate player details from all games played for week 6.*/
	,game_box_score_prep_week_8
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
	--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'October 9, 2023'
		AND 'October 15, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_8 (GBSPW8) shows player details and box scores from each contest lineup for week 8.*/
	,game_box_score_sum_week_8
AS (
	SELECT gbspw8.team_id
		/*,gbspw8.tokens_required*/
		,gbspw8.player_id
		,gbspw8.token
		,gbspw8.full_name
		,gbspw8.canonical
		,gbspw8.positions
		,gbspw8.age
		,gbspw8.star_rating
		,COUNT(DISTINCT gbspw8.game_id) AS games_played
		,SUM(gbspw8.wins)/5 AS wins
		,COUNT(DISTINCT gbspw8.game_id) - SUM(gbspw8.wins)/5 AS losses
		,SUM(gbspw8.pts) AS total_pts
		,SUM(gbspw8.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw8.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw8.fg) AS total_fg
		,SUM(gbspw8.fga) AS total_fga
		,SUM(gbspw8.fg) / NULLIF(CAST(SUM(gbspw8.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw8.two_p) AS total_two_p
		,SUM(gbspw8.two_pa) AS total_two_pa
		,SUM(gbspw8.two_p) / NULLIF(CAST(SUM(gbspw8.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw8.three_p) AS total_three_p
		,SUM(gbspw8.three_pa) AS total_three_pa
		,SUM(gbspw8.three_p) / NULLIF(CAST(SUM(gbspw8.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw8.ft) AS total_ft
		,SUM(gbspw8.fta) AS total_fta
		,SUM(gbspw8.ft) / NULLIF(CAST(SUM(gbspw8.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw8.orb) AS total_orb
		,SUM(gbspw8.drb) AS total_drb
		,SUM(gbspw8.trb) AS total_trb
		,SUM(gbspw8.ast) AS total_ast
		,SUM(gbspw8.stl) AS total_stl
		,SUM(gbspw8.blk) AS total_blk
		,SUM(gbspw8.tov) AS total_tov
		,SUM(gbspw8.pf) AS total_pf
		,SUM(gbspw8.pts) / NULLIF(CAST(2 * (SUM(gbspw8.fga) + (0.44 * SUM(gbspw8.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw8.fg) + (0.5 * SUM(gbspw8.three_p))) / NULLIF(CAST(SUM(gbspw8.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw8.pts) + (0.4 * SUM(gbspw8.fg)) - (0.7 * SUM(gbspw8.fga)) - (0.4 * (SUM(gbspw8.fta) - SUM(gbspw8.ft))) + (0.7 * SUM(gbspw8.orb)) + (0.3 * SUM(gbspw8.drb)) + (0.7 * SUM(gbspw8.ast)) + SUM(gbspw8.stl) + (0.7 * SUM(gbspw8.blk)) - SUM(gbspw8.tov) - (0.4 * SUM(gbspw8.pf)) AS game_score
	FROM game_box_score_prep_week_8 gbspw8
	GROUP BY gbspw8.team_id
		/*,gbspw8.tokens_required*/
		,gbspw8.player_id
		,gbspw8.token
		,gbspw8.full_name
		,gbspw8.canonical
		,gbspw8.positions
		,gbspw8.age
		,gbspw8.star_rating
	ORDER BY /*gbspw8.token
		,*/gbspw8.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_8 (GBSSW8) shows aggregate player details from all games played for week 8.*/
	,game_box_score_prep_week_9
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
		--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'October 16, 2023'
		AND 'October 22, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_9 (GBSPW9) shows player details and box scores from each contest lineup for week 9.*/
	,game_box_score_sum_week_9
AS (
	SELECT gbspw9.team_id
		/*,gbspw9.tokens_required
		,gbspw9.player_id
		,gbspw9.token
		,gbspw9.full_name
		,gbspw9.canonical
		,gbspw9.positions
		,gbspw9.age
		,gbspw9.star_rating*/
		,COUNT(DISTINCT gbspw9.game_id) AS games_played
		,SUM(gbspw9.wins)/5 AS wins
		,COUNT(DISTINCT gbspw9.game_id) - SUM(gbspw9.wins)/5 AS losses
		,SUM(gbspw9.pts) AS total_pts
		,SUM(gbspw9.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw9.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw9.fg) AS total_fg
		,SUM(gbspw9.fga) AS total_fga
		,SUM(gbspw9.fg) / NULLIF(CAST(SUM(gbspw9.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw9.two_p) AS total_two_p
		,SUM(gbspw9.two_pa) AS total_two_pa
		,SUM(gbspw9.two_p) / NULLIF(CAST(SUM(gbspw9.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw9.three_p) AS total_three_p
		,SUM(gbspw9.three_pa) AS total_three_pa
		,SUM(gbspw9.three_p) / NULLIF(CAST(SUM(gbspw9.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw9.ft) AS total_ft
		,SUM(gbspw9.fta) AS total_fta
		,SUM(gbspw9.ft) / NULLIF(CAST(SUM(gbspw9.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw9.orb) AS total_orb
		,SUM(gbspw9.drb) AS total_drb
		,SUM(gbspw9.trb) AS total_trb
		,SUM(gbspw9.ast) AS total_ast
		,SUM(gbspw9.stl) AS total_stl
		,SUM(gbspw9.blk) AS total_blk
		,SUM(gbspw9.tov) AS total_tov
		,SUM(gbspw9.pf) AS total_pf
		,SUM(gbspw9.pts) / NULLIF(CAST(2 * (SUM(gbspw9.fga) + (0.44 * SUM(gbspw9.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw9.fg) + (0.5 * SUM(gbspw9.three_p))) / NULLIF(CAST(SUM(gbspw9.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw9.pts) + (0.4 * SUM(gbspw9.fg)) - (0.7 * SUM(gbspw9.fga)) - (0.4 * (SUM(gbspw9.fta) - SUM(gbspw9.ft))) + (0.7 * SUM(gbspw9.orb)) + (0.3 * SUM(gbspw9.drb)) + (0.7 * SUM(gbspw9.ast)) + SUM(gbspw9.stl) + (0.7 * SUM(gbspw9.blk)) - SUM(gbspw9.tov) - (0.4 * SUM(gbspw9.pf)) AS game_score
	FROM game_box_score_prep_week_9 gbspw9
	GROUP BY gbspw9.team_id
		/*,gbspw9.tokens_required
		,gbspw9.player_id
		,gbspw9.token
		,gbspw9.full_name
		,gbspw9.canonical
		,gbspw9.positions
		,gbspw9.age
		,gbspw9.star_rating*/
	ORDER BY /*gbspw9.token
		,*/gbspw9.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_9 (GBSSW9) shows aggregate player details from all games played for week 9.*/
	,game_box_score_prep_week_10
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
	--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'October 23, 2023'
		AND 'October 29, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_10 (GBSPW10) shows player details and box scores from each contest lineup for week 10.*/
	,game_box_score_sum_week_10
AS (
	SELECT gbspw10.team_id
		/*,gbspw10.tokens_required*/
		,gbspw10.player_id
		,gbspw10.token
		,gbspw10.full_name
		,gbspw10.canonical
		,gbspw10.positions
		,gbspw10.age
		,gbspw10.star_rating
		,COUNT(DISTINCT gbspw10.game_id) AS games_played
		,SUM(gbspw10.wins)/5 AS wins
		,COUNT(DISTINCT gbspw10.game_id) - SUM(gbspw10.wins)/5 AS losses
		,SUM(gbspw10.pts) AS total_pts
		,SUM(gbspw10.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw10.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw10.fg) AS total_fg
		,SUM(gbspw10.fga) AS total_fga
		,SUM(gbspw10.fg) / NULLIF(CAST(SUM(gbspw10.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw10.two_p) AS total_two_p
		,SUM(gbspw10.two_pa) AS total_two_pa
		,SUM(gbspw10.two_p) / NULLIF(CAST(SUM(gbspw10.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw10.three_p) AS total_three_p
		,SUM(gbspw10.three_pa) AS total_three_pa
		,SUM(gbspw10.three_p) / NULLIF(CAST(SUM(gbspw10.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw10.ft) AS total_ft
		,SUM(gbspw10.fta) AS total_fta
		,SUM(gbspw10.ft) / NULLIF(CAST(SUM(gbspw10.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw10.orb) AS total_orb
		,SUM(gbspw10.drb) AS total_drb
		,SUM(gbspw10.trb) AS total_trb
		,SUM(gbspw10.ast) AS total_ast
		,SUM(gbspw10.stl) AS total_stl
		,SUM(gbspw10.blk) AS total_blk
		,SUM(gbspw10.tov) AS total_tov
		,SUM(gbspw10.pf) AS total_pf
		,SUM(gbspw10.pts) / NULLIF(CAST(2 * (SUM(gbspw10.fga) + (0.44 * SUM(gbspw10.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw10.fg) + (0.5 * SUM(gbspw10.three_p))) / NULLIF(CAST(SUM(gbspw10.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw10.pts) + (0.4 * SUM(gbspw10.fg)) - (0.7 * SUM(gbspw10.fga)) - (0.4 * (SUM(gbspw10.fta) - SUM(gbspw10.ft))) + (0.7 * SUM(gbspw10.orb)) + (0.3 * SUM(gbspw10.drb)) + (0.7 * SUM(gbspw10.ast)) + SUM(gbspw10.stl) + (0.7 * SUM(gbspw10.blk)) - SUM(gbspw10.tov) - (0.4 * SUM(gbspw10.pf)) AS game_score
	FROM game_box_score_prep_week_10 gbspw10
	GROUP BY gbspw10.team_id
		/*,gbspw10.tokens_required*/
		,gbspw10.player_id
		,gbspw10.token
		,gbspw10.full_name
		,gbspw10.canonical
		,gbspw10.positions
		,gbspw10.age
		,gbspw10.star_rating
	ORDER BY /*gbspw10.token
		,*/gbspw10.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_10 (GBSSW10) shows aggregate player details from all games played for week 10.*/
	,game_box_score_prep_week_11
AS (
	SELECT /*ROW_NUMBER() OVER (
			PARTITION BY sp.token ORDER BY gtb.created_at ASC
			) AS row
		,*/gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		--,gtb.contest_id
		,gtb.game_kind
		,gtb.created_at::DATE AS created_at
		,gtb.tokens_required
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id AS player_id
		,sp.token
		,sp.full_name
		,sp.canonical
		,CASE 
			WHEN sp.position_2 <> ''
				THEN CONCAT (
						sp.position_1
						,'-'
						,sp.position_2
						)
			ELSE sp.position_1
			END AS positions
		,sp.age
		,sp.star_rating
		,CASE 
			WHEN gtb.own_score > gtb.opponent_score
				THEN 1
			ELSE 0
			END AS wins
		,sb.pts
		,sb.fg
		,sb.fga
		,sb.two_p
		,sb.two_pa
		,sb.three_p
		,sb.three_pa
		,sb.ft
		,sb.fta
		,sb.orb
		,sb.drb
		,sb.trb
		,sb.ast
		,sb.stl
		,sb.blk
		,sb.tov
		,sb.pf
		,sb.pts / NULLIF(CAST(2 * (sb.fga + (0.44 * sb.fta)) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(sb.fg + (0.5 * sb.three_p)) / NULLIF(CAST(sb.fga AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,sb.pts + (0.4 * sb.fg) - (0.7 * sb.fga) - (0.4 * (sb.fta - sb.ft)) + (0.7 * sb.orb) + (0.3 * sb.drb) + (0.7 * sb.ast) + sb.stl + (0.7 * sb.blk) - sb.tov - (0.4 * sb.pf) AS game_score
		,CONCAT (
			'https://app.playswoops.com/headtohead/'
			,gtb.game_id
			,'/joined/boxscore'
			) AS game_url
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
		--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	WHERE gtb.created_at::DATE BETWEEN 'October 30, 2023'
		AND 'November 5, 2023'
		/*AND gtb.tourney_id = ?
		AND gtb.tokens_required = ?
		AND gtb.game_id = ?
		AND glp.team_id = ?*/
	ORDER BY gtb.created_at ASC
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP_WEEK_11 (GBSPW11) shows player details and box scores from each contest lineup for week 11.*/
	,game_box_score_sum_week_11
AS (
	SELECT gbspw11.team_id
		/*,gbspw11.tokens_required
		,gbspw11.player_id
		,gbspw11.token
		,gbspw11.full_name
		,gbspw11.canonical
		,gbspw11.positions
		,gbspw11.age
		,gbspw11.star_rating*/
		,COUNT(DISTINCT gbspw11.game_id) AS games_played
		,SUM(gbspw11.wins)/5 AS wins
		,COUNT(DISTINCT gbspw11.game_id) - SUM(gbspw11.wins)/5 AS losses
		,SUM(gbspw11.pts) AS total_pts
		,SUM(gbspw11.pts) / NULLIF(CAST(COUNT(DISTINCT gbspw11.game_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbspw11.fg) AS total_fg
		,SUM(gbspw11.fga) AS total_fga
		,SUM(gbspw11.fg) / NULLIF(CAST(SUM(gbspw11.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbspw11.two_p) AS total_two_p
		,SUM(gbspw11.two_pa) AS total_two_pa
		,SUM(gbspw11.two_p) / NULLIF(CAST(SUM(gbspw11.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbspw11.three_p) AS total_three_p
		,SUM(gbspw11.three_pa) AS total_three_pa
		,SUM(gbspw11.three_p) / NULLIF(CAST(SUM(gbspw11.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbspw11.ft) AS total_ft
		,SUM(gbspw11.fta) AS total_fta
		,SUM(gbspw11.ft) / NULLIF(CAST(SUM(gbspw11.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbspw11.orb) AS total_orb
		,SUM(gbspw11.drb) AS total_drb
		,SUM(gbspw11.trb) AS total_trb
		,SUM(gbspw11.ast) AS total_ast
		,SUM(gbspw11.stl) AS total_stl
		,SUM(gbspw11.blk) AS total_blk
		,SUM(gbspw11.tov) AS total_tov
		,SUM(gbspw11.pf) AS total_pf
		,SUM(gbspw11.pts) / NULLIF(CAST(2 * (SUM(gbspw11.fga) + (0.44 * SUM(gbspw11.fta))) AS DECIMAL(10, 4)), 0) * 100 AS ts_pct
		,(SUM(gbspw11.fg) + (0.5 * SUM(gbspw11.three_p))) / NULLIF(CAST(SUM(gbspw11.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbspw11.pts) + (0.4 * SUM(gbspw11.fg)) - (0.7 * SUM(gbspw11.fga)) - (0.4 * (SUM(gbspw11.fta) - SUM(gbspw11.ft))) + (0.7 * SUM(gbspw11.orb)) + (0.3 * SUM(gbspw11.drb)) + (0.7 * SUM(gbspw11.ast)) + SUM(gbspw11.stl) + (0.7 * SUM(gbspw11.blk)) - SUM(gbspw11.tov) - (0.4 * SUM(gbspw11.pf)) AS game_score
	FROM game_box_score_prep_week_11 gbspw11
	GROUP BY gbspw11.team_id
		/*,gbspw11.tokens_required
		,gbspw11.player_id
		,gbspw11.token
		,gbspw11.full_name
		,gbspw11.canonical
		,gbspw11.positions
		,gbspw11.age
		,gbspw11.star_rating*/
	ORDER BY /*gbspw11.token
		,*/gbspw11.team_id
	)
/*GAME_BOX_SCORE_SUM_WEEK_11 (GBSSW11) shows aggregate player details from all games played for week 11.*/
/*TEAMS*/
	,player_owner_details
AS (
	SELECT gp.id
		,gp.team_id
		,gt.name
		,LOWER(au.email) AS email
		,CASE 
			WHEN gt.path <> ''
				THEN 'Y'
			ELSE 'N'
			END AS logo
		,au.wallet_address
		,CONCAT (
			'https://app.playswoops.com/locker-room/'
			,gt.id
			,'/roster'
			) AS locker
	FROM game_player gp
	INNER JOIN game_team gt ON gp.team_id = gt.id
	INNER JOIN accounts_user au ON gt.owner_id = au.id
	ORDER BY gp.team_id
		,gp.id
	)
/*PLAYER_OWNER_DETAILS (POD) shows players' current team details.*/
	,team_earnings (team_id, earnings)
AS (
	VALUES (7, 176.5)
		,(10, 452.5)
		,(11, 115)
		,(13, 5)
		,(15, 439)
		,(16, 2)
		,(17, 2)
		,(18, 1117)
		,(19, 435.5)
		,(20, 18)
		,(22, 9860)
		,(27, 397)
		,(29, 1762.5)
		,(31, 214.5)
		,(38, 10.75)
		,(47, 516.25)
		,(53, 434.75)
		,(54, 15)
		,(56, 112)
		,(57, 40)
		,(60, 80)
		,(61, 107.25)
		,(62, 1219.5)
		,(63, 100)
		,(64, 609)
		,(67, 16.5)
		,(71, 4.25)
		,(74, 21.5)
		,(77, 58.5)
		,(78, 334)
		,(79, 1211.5)
		,(80, 1453)
		,(82, 375.75)
		,(84, 639.25)
		,(88, 1407.75)
		,(94, 1)
		,(95, 218.5)
		,(101, 426.75)
		,(105, 47)
		,(112, 2735.75)
		,(118, 60)
		,(135, 4)
		,(137, 477.75)
		,(138, 3)
		,(139, 82)
		,(141, 1070.5)
		,(144, 82.25)
		,(145, 45)
		,(146, 131.25)
		,(148, 854.75)
		,(153, 895)
		,(157, 16.75)
		,(158, 3646.75)
		,(171, 3)
		,(176, 144)
		,(190, 85.75)
		,(194, 1)
		,(209, 1.5)
		,(210, 20)
		,(216, 88.75)
		,(223, 88.5)
		,(231, 318.5)
		,(236, 195.75)
		,(244, 152.5)
		,(264, 124)
		,(269, 169.5)
		,(271, 1013)
		,(285, 2096.25)
		,(303, 2)
		,(307, 3.75)
		,(311, 92)
		,(313, 148)
		,(393, 85)
		,(408, 23.25)
		,(433, 16)
		,(435, 2)
		,(436, 8)
		,(442, 62)
		,(467, 81.25)
		,(471, 170)
		,(474, 39)
		,(481, 59.75)
		,(504, 13)
		,(507, 218.75)
		,(508, 60.75)
		,(518, 158)
		,(520, 6)
		,(536, 402.25)
		,(541, 15.5)
		,(544, 31.75)
		,(546, 39)
		,(640, 4.75)
		,(643, 0.25)
		,(659, 1)
		,(663, 128.25)
		,(665, 0.25)
		,(735, 21)
		,(736, 1.25)
		,(768, 993)
		,(781, 45)
		,(786, 9.5)
		,(793, 40)
		,(821, 100)
		,(848, 4)
		,(867, 2)
		,(872, 3)
		,(879, 7)
		,(884, 107)
		,(891, 46)
		,(897, 42)
		,(913, 2)
		,(924, 40)
		,(932, 6)
		,(935, 6)
		,(943, 123)
		,(948, 54)
		,(949, 2)
		,(954, 10)
		,(957, 468)
		,(966, 50)
		,(967, 392)
		,(969, 10)
		,(977, 40)
		,(982, 2)
		,(987, 1)
		,(1005, 10)
		,(1012, 41)
		,(1034, 369)
		,(1037, 40)
		,(1040, 54)
		,(1045, 40)
		,(1046, 132)
		,(1058, 78)
		,(1065, 131)
		,(1066, 1)
		,(1093, 6)
		,(1101, 3)
		,(1111, 8)
		,(1122, 6)
		,(1129, 2)
		,(1158, 5)
		,(1159, 13)
		,(1160, 16)
		,(1161, 1)
		,(1310, 1)
	)
/*TEAM_EARNINGS (TE) shows earnings by team.*/
	,lineup_prep
AS (
	SELECT gl.id AS lineup_id
		,gl.team_id
		,gt.name
		,LOWER(au.email) AS email
		,TO_CHAR(au.date_joined::DATE, 'MM/DD/YY') AS date_joined
		,CASE
			WHEN gt.path <> ''
				THEN 'Y'
			ELSE 'N'
			END AS logo
		,CASE 
			WHEN gt.path <> ''
				THEN CONCAT (
						'https://swoops-ugc.s3.us-west-1.amazonaws.com/'
						,gt.path
						)
			ELSE 'N/A'
			END AS logo_url
		,au.wallet_address AS wallet
		,CONCAT (
			'https://app.playswoops.com/locker-room/'
			,gl.team_id
			,'/roster'
			) AS locker
		,CONCAT (
			'https://etherscan.io/address/'
			,au.wallet_address
			,'#nfttransfers'
			) AS etherscan
	FROM game_team gt
	INNER JOIN accounts_user au ON gt.owner_id = au.id
	INNER JOIN game_lineup gl ON gt.id = gl.team_id
	)
/*LINEUP_PREP (LP) shows lineup details by team.*/
	,game_team_full_lineups
AS (
	SELECT gtb.tourney_id
		,gtb.tourney_kind
		,gtb.tourney_name
		,gtb.tourney_date
		,gtb.tourney_size
		,gtb.tourney_payout
		,gtb.game_id
		,gtb.contest_id
		,gtb.created_at
		--,gtb.played_at
		,gtb.simulation_id
		,gtb.game_kind
		,gtb.tokens_required
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score
		,lp.lineup_id
		,lp.team_id
		,lp.name
		,lp.email
		,lp.date_joined
		,lp.logo
		,lp.logo_url
		,lp.wallet
		,lp.locker
		,lp.etherscan
		,gtb.meta
		,gtb.tourney_url
	FROM game_team_base gtb
	INNER JOIN lineup_prep lp ON gtb.lineup_id = lp.lineup_id
	)
/*GAME_TEAM_FULL_LINEUPS (GTFL) normalizes all contest details at the individual team perspective.*/
	,team_player_totals_week_2
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY gbssw2.team_id ORDER BY gbssw2.total_pts DESC
			) AS row
		,gbssw2.team_id
		/*,pod.name
		,pod.email
		,pod.locker*/
		,gbssw2.player_id
		,gbssw2.token
		,gbssw2.full_name
		,gbssw2.canonical
		,gbssw2.positions
		,gbssw2.age
		,gbssw2.star_rating
		,gbssw2.games_played
		,gbssw2.total_pts
	FROM game_box_score_sum_week_2 gbssw2
	--LEFT JOIN player_owner_details pod ON gbssw2.team_id = pod.team_id /*POD shows who currently owns player*/
	ORDER BY gbssw2.team_id
	)
/*TEAM_PLAYER_TOTALS_WEEK_2 (TPTW2) ranks aggregate player stats across the team for week 2.*/
	,team_player_totals_week_4
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY gbssw4.team_id ORDER BY gbssw4.total_trb DESC
			) AS row
		,gbssw4.team_id
		/*,pod.name
		,pod.email
		,pod.locker*/
		,gbssw4.player_id
		,gbssw4.token
		,gbssw4.full_name
		,gbssw4.canonical
		,gbssw4.positions
		,gbssw4.age
		,gbssw4.star_rating
		,gbssw4.games_played
		,gbssw4.total_trb
	FROM game_box_score_sum_week_4 gbssw4
	--LEFT JOIN player_owner_details pod ON gbssw4.team_id = pod.team_id /*POD shows who currently owns player*/
	ORDER BY gbssw4.team_id
	)
/*TEAM_PLAYER_TOTALS_WEEK_4 (TPTW4) ranks aggregate player stats across the team for week 4.*/
	,team_player_totals_week_6
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY gbssw6.team_id ORDER BY gbssw6.total_blk DESC
			) AS row
		,gbssw6.team_id
		/*,pod.name
		,pod.email
		,pod.locker*/
		,gbssw6.player_id
		,gbssw6.token
		,gbssw6.full_name
		,gbssw6.canonical
		,gbssw6.positions
		,gbssw6.age
		,gbssw6.star_rating
		,gbssw6.games_played
		,gbssw6.total_blk
	FROM game_box_score_sum_week_6 gbssw6
	--LEFT JOIN player_owner_details pod ON gbssw6.team_id = pod.team_id /*POD shows who currently owns player*/
	ORDER BY gbssw6.team_id
	)
/*TEAM_PLAYER_TOTALS_WEEK_6 (TPTW6) ranks aggregate player stats across the team for week 6.*/
	,team_player_totals_week_8
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY gbssw8.team_id ORDER BY gbssw8.total_ast DESC
			) AS row
		,gbssw8.team_id
		/*,pod.name
		,pod.email
		,pod.locker*/
		,gbssw8.player_id
		,gbssw8.token
		,gbssw8.full_name
		,gbssw8.canonical
		,gbssw8.positions
		,gbssw8.age
		,gbssw8.star_rating
		,gbssw8.games_played
		,gbssw8.total_ast
	FROM game_box_score_sum_week_8 gbssw8
	--LEFT JOIN player_owner_details pod ON gbssw8.team_id = pod.team_id /*POD shows who currently owns player*/
	ORDER BY gbssw8.team_id
	)
/*TEAM_PLAYER_TOTALS_WEEK_8 (TPTW8) ranks aggregate player stats across the team for week 8.*/
	,team_player_totals_week_10
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY gbssw10.team_id ORDER BY gbssw10.total_three_p DESC
			) AS row
		,gbssw10.team_id
		/*,pod.name
		,pod.email
		,pod.locker*/
		,gbssw10.player_id
		,gbssw10.token
		,gbssw10.full_name
		,gbssw10.canonical
		,gbssw10.positions
		,gbssw10.age
		,gbssw10.star_rating
		,gbssw10.games_played
		,gbssw10.total_three_p
	FROM game_box_score_sum_week_10 gbssw10
	--LEFT JOIN player_owner_details pod ON gbssw10.team_id = pod.team_id /*POD shows who currently owns player*/
	ORDER BY gbssw10.team_id
	)
/*TEAM_PLAYER_TOTALS_WEEK_10 (TPTW10) ranks aggregate player stats across the team for week 10.*/
/*TOURNEYS*/
	,tourney_result_base
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY tourney_id ORDER BY SUM((gtfl.own_score > gtfl.opponent_score)::INT) DESC, COUNT(gtfl.*) DESC, gtfl.team_id ASC
			) AS row
		,gtfl.tourney_id
		,gtfl.tourney_kind
		,gtfl.tourney_name
		,gtfl.tourney_date
		,gtfl.tokens_required
		,gtfl.tourney_size
		,gtfl.tourney_payout
		,gtfl.team_id
		,gtfl.name
		,gtfl.email
		,gtfl.date_joined
		,gtfl.created_at::DATE AS created_at
		,SUM((gtfl.own_score > gtfl.opponent_score)::INT) AS wins
		,SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS losses
		,AVG(gtfl.own_score) AS ppg
		,AVG(gtfl.opponent_score) AS opp_ppg
		,AVG(gtfl.own_score - gtfl.opponent_score) AS diff
		,gtfl.logo
		,gtfl.logo_url
		,gtfl.wallet
		,gtfl.locker
		,gtfl.etherscan
		,gtfl.meta
		,gtfl.tourney_url
	FROM game_team_full_lineups gtfl
	INNER JOIN game_contest gc ON gtfl.contest_id = gc.id
	WHERE gc.kind = 'TOURNAMENT'
		AND gtfl.tourney_id IS NOT NULL
	GROUP BY gtfl.tourney_id
		,gtfl.tourney_kind
		,gtfl.tourney_name
		,gtfl.tourney_date
		,gtfl.tokens_required
		,gtfl.tourney_size
		,gtfl.tourney_payout
		,gtfl.team_id
		,gtfl.name
		,gtfl.email
		,gtfl.date_joined
		,gtfl.created_at::DATE
		,gtfl.logo
		,gtfl.logo_url
		,gtfl.wallet
		,gtfl.locker
		,gtfl.etherscan
		,gtfl.meta
		,gtfl.tourney_url
	ORDER BY gtfl.tourney_id
	)
/*TOURNEY_RESULT_BASE (TRB) returns contest results and streak types for all completed tourney games PARTITIONED by team id and ORDERED by played time DESC.*/
	,tourney_top_64_base
AS (
	SELECT trb.row
		,trb.tourney_id
		,trb.tourney_kind
		,trb.tourney_name
		,trb.tourney_date
		,trb.tourney_size
		,trb.tourney_payout
		,trb.tokens_required
		,trb.team_id
		,trb.name
		,trb.email
		,trb.date_joined
		,trb.created_at
		,trb.wins
		,trb.losses
		,trb.ppg
		,trb.opp_ppg
		,trb.diff
		,trb.logo
		,trb.logo_url
		,trb.wallet
		,trb.locker
		,trb.etherscan
		,trb.meta
		,trb.tourney_url
	FROM tourney_result_base trb
	WHERE trb.row <= 64
	ORDER BY trb.tourney_id
		,trb.row
	)
/*TOURNEY_TOP_64_BASE (TT64B) returns details for the top 64 teams in each tournament.*/
	,tourney_sp_prep
AS (
	SELECT tt64b.row
		,tt64b.tourney_id
		,tt64b.tourney_kind
		,tt64b.tourney_name
		,tt64b.tourney_date
		,tt64b.tourney_size
		,tt64b.tourney_payout
		,tt64b.tokens_required
		,tt64b.team_id
		,tt64b.name
		,tt64b.email
		,tt64b.date_joined
		,tt64b.created_at
		,tt64b.wins
		,tt64b.losses
		,tt64b.ppg
		,tt64b.opp_ppg
		,tt64b.diff
		,tt64b.logo
		,tt64b.logo_url
		,tt64b.wallet
		,tt64b.locker
		,tt64b.etherscan
		,tt64b.meta
		,tt64b.tourney_url
		,CASE
			WHEN tt64b.tokens_required = 1
				AND tt64b.row = 1
				THEN 125
			WHEN tt64b.tokens_required = 1
				AND tt64b.row = 2
				THEN 100
			WHEN tt64b.tokens_required = 1
				AND tt64b.row IN (3, 4)
				THEN 75
			WHEN tt64b.tokens_required = 1
				AND tt64b.row BETWEEN 5 AND 8
				THEN 40
			WHEN tt64b.tokens_required = 1
				AND tt64b.row BETWEEN 9 AND 16
				THEN 20
			WHEN tt64b.tokens_required = 1
				AND tt64b.row BETWEEN 17 AND 32
				THEN 10
			WHEN tt64b.tokens_required = 1
				AND tt64b.row BETWEEN 33 AND 64
				THEN 5
			WHEN tt64b.tokens_required = 3
				AND tt64b.row = 1
				THEN 250
			WHEN tt64b.tokens_required = 3
				AND tt64b.row = 2
				THEN 200
			WHEN tt64b.tokens_required = 3
				AND tt64b.row IN (3, 4)
				THEN 150
			WHEN tt64b.tokens_required = 3
				AND tt64b.row BETWEEN 5 AND 8
				THEN 75
			WHEN tt64b.tokens_required = 3
				AND tt64b.row BETWEEN 9 AND 16
				THEN 40
			WHEN tt64b.tokens_required = 3
				AND tt64b.row BETWEEN 17 AND 32
				THEN 20
			WHEN tt64b.tokens_required = 3
				AND tt64b.row BETWEEN 33 AND 64
				THEN 10
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row = 1
				THEN 500
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row = 2
				THEN 400
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row IN (3, 4)
				THEN 300
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row BETWEEN 5 AND 8
				THEN 150
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row BETWEEN 9 AND 16
				THEN 80
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row BETWEEN 17 AND 32
				THEN 40
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name NOT LIKE '%All-Star%'
				AND tt64b.tourney_name NOT LIKE '%Rookie Fest%'
				AND tt64b.tourney_name NOT LIKE '%Global Open%'
				AND tt64b.tourney_name NOT LIKE '%SOA Cup%'
				AND tt64b.tourney_name NOT LIKE '%Swooper Bowl%'
				AND tt64b.tourney_name NOT LIKE '%Bronze Jug%'
				AND tt64b.row BETWEEN 33 AND 64
				THEN 20
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name LIKE '%Global Open%'
				OR tt64b.tourney_name LIKE '%SOA Cup%'
				AND tt64b.row = 1
				THEN 1000
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name LIKE '%Global Open%'
				OR tt64b.tourney_name LIKE '%SOA Cup%'
				AND tt64b.row = 2
				THEN 800
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name LIKE '%Global Open%'
				OR tt64b.tourney_name LIKE '%SOA Cup%'
				AND tt64b.row IN (3, 4)
				THEN 600
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name LIKE '%Global Open%'
				OR tt64b.tourney_name LIKE '%SOA Cup%'
				AND tt64b.row BETWEEN 5 AND 8
				THEN 300
			WHEN tt64b.tokens_required = 5
				AND tt64b.tourney_name LIKE '%Global Open%'
				OR tt64b.tourney_name LIKE '%SOA Cup%'
				AND tt64b.row BETWEEN 9 AND 16
				THEN 150
			WHEN tt64b.tokens_required = 5
				AND tt64b.row BETWEEN 17 AND 32
				THEN 80
			WHEN tt64b.tokens_required = 5
				AND tt64b.row BETWEEN 33 AND 64
				THEN 40
			ELSE 0
			END AS tourney_sp
	FROM tourney_top_64_base tt64b
	)
/*TOURNEY_SP_PREP (TSP) shows SP details for the top 64 teams in each tournament.*/
	,tourney_sp_totals
AS (
	SELECT tst.team_id
		,tst.name
		,tst.email
		,tst.date_joined
		,SUM(tst.tourney_sp) AS total_tourney_sp
	FROM tourney_sp_prep tst
	GROUP BY tst.team_id
		,tst.name
		,tst.email
		,tst.date_joined
	ORDER BY tst.team_id
	)
/*TOURNEY_SP_TOTALS (TST) shows aggregate SP at the team level*/
/*SWOOP POINTS*/
	,game_team_leaderboard
AS (
	SELECT gtfl.team_id
		,gtfl.name
		,gtfl.email
		,gtfl.date_joined
		,gtfl.created_at::DATE AS created_at
		,SUM((gtfl.own_score > gtfl.opponent_score)::INT) AS wins
		,SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS losses
		,COUNT(gtfl.*) AS entries
		,SUM((gtfl.own_score > gtfl.opponent_score)::INT) FILTER(WHERE gtfl.game_kind = 'HEAD_TO_HEAD_MATCH_MAKE') AS mm_wins
		,SUM((gtfl.own_score < gtfl.opponent_score)::INT) FILTER(WHERE gtfl.game_kind = 'HEAD_TO_HEAD_MATCH_MAKE') AS mm_losses
		,COUNT(gtfl.*) FILTER(WHERE gtfl.game_kind = 'HEAD_TO_HEAD_MATCH_MAKE') AS mm_entries
		,CASE
			WHEN SUM((gtfl.own_score > gtfl.opponent_score)::INT) + SUM((gtfl.own_score < gtfl.opponent_score)::INT) >= 5
				THEN 150
			ELSE 0
			END AS daily_sp
		/*,(SUM((gtfl.own_score > gtfl.opponent_score)::INT) / NULLIF(CAST(COUNT(*) AS DECIMAL(10, 4)), 0) * 100) AS win_pct
		,AVG(gtfl.own_score) AS ppg
		,AVG(gtfl.opponent_score) AS opp_ppg
		,AVG(gtfl.own_score - gtfl.opponent_score) AS diff
		,gtfl.logo
		,gtfl.wallet
		,gtfl.locker*/
	FROM game_team_full_lineups gtfl
	--WHERE gtfl.email LIKE '%'
	GROUP BY gtfl.team_id
		,gtfl.name
		,gtfl.email
		,gtfl.date_joined
		,gtfl.created_at::DATE
		/*,gtfl.logo
		,gtfl.wallet
		,gtfl.locker*/
	ORDER BY gtfl.team_id ASC
		,gtfl.created_at::DATE ASC
	)
/*GAME_TEAM_LEADERBOARD (GTL) aggregates and shows entries with XP by day.*/
	,total_team_leaderboard
AS (
	SELECT gtl.team_id
		,gtl.name
		,gtl.email
		,gtl.date_joined
		,SUM(gtl.wins) AS total_wins
		,SUM(gtl.losses) AS total_losses
		,SUM(gtl.entries) AS total_entries
		,SUM(gtl.mm_wins) AS total_wins
		,SUM(gtl.mm_losses) AS total_losses
		,SUM(gtl.mm_entries) AS total_mm_entries
		,SUM(gtl.daily_sp) AS total_daily_sp
	FROM game_team_leaderboard gtl
	GROUP BY gtl.team_id
		,gtl.name
		,gtl.email
		,gtl.date_joined
	ORDER BY gtl.team_id
	)
/*TOTAL_TEAM_LEADERBOARD (TTL) shows total entries and daily XP on team level.*/
	,team_leaderboard_week_1
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'August 21, 2023'
	    AND 'August 27, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_1 (TLW1) shows total wins, entries, and matchmade entries on team level for week 1.*/
	,team_leaderboard_week_2
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'August 28, 2023'
	    AND 'September 3, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_2 (TLW2) shows total wins, entries, and matchmade entries on team level for week 2.*/
	,team_leaderboard_week_3
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'September 4, 2023'
	    AND 'September 10, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_3 (TLW3) shows total wins, entries, and matchmade entries on team level for week 3.*/
	,team_leaderboard_week_4
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'September 11, 2023'
	    AND 'September 17, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_4 (TLW4) shows total wins, entries, and matchmade entries on team level for week 4.*/
	,team_leaderboard_week_5
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'September 18, 2023'
	    AND 'September 24, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_5 (TLW5) shows total wins, entries, and matchmade entries on team level for week 5.*/
	,team_leaderboard_week_6
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'September 25, 2023'
	    AND 'October 1, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_6 (TLW6) shows total wins, entries, and matchmade entries on team level for week 6.*/
	,team_leaderboard_week_7
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'October 2, 2023'
	    AND 'October 8, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_7 (TLW7) shows total wins, entries, and matchmade entries on team level for week 7.*/
	,team_leaderboard_week_8
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'October 9, 2023'
	    AND 'October 15, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_8 (TLW8) shows total wins, entries, and matchmade entries on team level for week 8.*/
	,team_leaderboard_week_9
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'October 16, 2023'
	    AND 'October 22, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_9 (TLW9) shows total wins, entries, and matchmade entries on team level for week 9.*/
	,team_leaderboard_week_10
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'October 23, 2023'
	    AND 'October 29, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_10 (TLW10) shows total wins, entries, and matchmade entries on team level for week 10.*/
	,team_leaderboard_week_11
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
		,SUM(gtl.entries) AS weekly_entries
		,SUM(gtl.mm_entries) AS weekly_mm_entries
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'October 30, 2023'
	    AND 'November 5, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*TEAM_LEADERBOARD_WEEK_11 (TLW11) shows total wins, entries, and matchmade entries on team level for week 11.*/
	,all_week_leaderboard
AS (
	SELECT DISTINCT gtfl.team_id
		,gtfl.name
		,COALESCE(tlw1.weekly_wins, 0) AS weekly_wins1
		,COALESCE(tlw2.weekly_wins, 0) AS weekly_wins2
		,COALESCE(tlw3.weekly_wins, 0) AS weekly_wins3
		,COALESCE(tlw4.weekly_wins, 0) AS weekly_wins4
		,COALESCE(tlw5.weekly_wins, 0) AS weekly_wins5
		,COALESCE(tlw6.weekly_wins, 0) AS weekly_wins6
		,COALESCE(tlw7.weekly_wins, 0) AS weekly_wins7
		,COALESCE(tlw8.weekly_wins, 0) AS weekly_wins8
		,COALESCE(tlw9.weekly_wins, 0) AS weekly_wins9
		,COALESCE(tlw10.weekly_wins, 0) AS weekly_wins10
		,COALESCE(tlw11.weekly_wins, 0) AS weekly_wins11
		,CASE
			WHEN tlw1.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp1
		,CASE
			WHEN tlw2.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp2
		,CASE
			WHEN tlw3.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp3
		,CASE
			WHEN tlw4.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp4
		,CASE
			WHEN tlw5.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp5
		,CASE
			WHEN tlw6.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp6
		,CASE
			WHEN tlw7.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp7
		,CASE
			WHEN tlw8.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp8
		,CASE
			WHEN tlw9.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp9
		,CASE
			WHEN tlw10.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp10
		,CASE
			WHEN tlw11.weekly_wins >= 25
				THEN 300
			ELSE 0
			END AS weekly_sp11
		,COALESCE(tlw1.weekly_mm_entries, 0) AS weekly_mm_entries1
		,COALESCE(tlw2.weekly_mm_entries, 0) AS weekly_mm_entries2
		,COALESCE(tlw3.weekly_mm_entries, 0) AS weekly_mm_entries3
		,COALESCE(tlw4.weekly_mm_entries, 0) AS weekly_mm_entries4
		,COALESCE(tlw5.weekly_mm_entries, 0) AS weekly_mm_entries5
		,COALESCE(tlw6.weekly_mm_entries, 0) AS weekly_mm_entries6
		,COALESCE(tlw7.weekly_mm_entries, 0) AS weekly_mm_entries7
		,COALESCE(tlw8.weekly_mm_entries, 0) AS weekly_mm_entries8
		,COALESCE(tlw9.weekly_mm_entries, 0) AS weekly_mm_entries9
		,COALESCE(tlw10.weekly_mm_entries, 0) AS weekly_mm_entries10
		,COALESCE(tlw11.weekly_mm_entries, 0) AS weekly_mm_entries11
		,CASE
			WHEN tlw1.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp1
		,CASE
			WHEN tlw2.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp2
		,CASE
			WHEN tlw3.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp3
		,CASE
			WHEN tlw4.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp4
		,CASE
			WHEN tlw5.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp5
		,CASE
			WHEN tlw6.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp6
		,CASE
			WHEN tlw7.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp7
		,CASE
			WHEN tlw8.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp8
		,CASE
			WHEN tlw9.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp9
		,CASE
			WHEN tlw10.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp10
		,CASE
			WHEN tlw11.weekly_mm_entries >= 35
				THEN 150
			ELSE 0
			END AS weekly_mm_sp11
	FROM game_team_full_lineups gtfl
	LEFT JOIN team_leaderboard_week_1 tlw1 ON gtfl.team_id = tlw1.team_id
	LEFT JOIN team_leaderboard_week_2 tlw2 ON gtfl.team_id = tlw2.team_id
	LEFT JOIN team_leaderboard_week_3 tlw3 ON gtfl.team_id = tlw3.team_id
	LEFT JOIN team_leaderboard_week_4 tlw4 ON gtfl.team_id = tlw4.team_id
	LEFT JOIN team_leaderboard_week_5 tlw5 ON gtfl.team_id = tlw5.team_id
	LEFT JOIN team_leaderboard_week_6 tlw6 ON gtfl.team_id = tlw6.team_id
	LEFT JOIN team_leaderboard_week_7 tlw7 ON gtfl.team_id = tlw7.team_id
	LEFT JOIN team_leaderboard_week_8 tlw8 ON gtfl.team_id = tlw8.team_id
	LEFT JOIN team_leaderboard_week_9 tlw9 ON gtfl.team_id = tlw9.team_id
	LEFT JOIN team_leaderboard_week_10 tlw10 ON gtfl.team_id = tlw10.team_id
	LEFT JOIN team_leaderboard_week_11 tlw11 ON gtfl.team_id = tlw11.team_id
	)
/*ALL_WEEK_LEADERBOARD (AWL) shows wins, matchmade entries, and SP for each of weeks 1-11.*/
	,total_week_leaderboard
AS (
	SELECT awl.team_id
		,awl.name
		,awl.weekly_wins1 + awl.weekly_wins2 + awl.weekly_wins3 + awl.weekly_wins4 + awl.weekly_wins5 + awl.weekly_wins6 + awl.weekly_wins7 + awl.weekly_wins8 + awl.weekly_wins9 + awl.weekly_wins10 + awl.weekly_wins11 AS total_weekly_wins
		,awl.weekly_sp1 + awl.weekly_sp2 + awl.weekly_sp3 + awl.weekly_sp4 + awl.weekly_sp5 + awl.weekly_sp6 + awl.weekly_sp7 + awl.weekly_sp8 + awl.weekly_sp9 + awl.weekly_sp10 + awl.weekly_sp11 AS total_weekly_sp
		,awl.weekly_mm_entries1 + awl.weekly_mm_entries2 + awl.weekly_mm_entries3 + awl.weekly_mm_entries4 + awl.weekly_mm_entries5 + awl.weekly_mm_entries6 + awl.weekly_mm_entries7 + awl.weekly_mm_entries8 + awl.weekly_mm_entries9 + awl.weekly_mm_entries10 + awl.weekly_mm_entries11 AS total_weekly_mm_entries
		,awl.weekly_mm_sp1 + awl.weekly_mm_sp2 + awl.weekly_mm_sp3 + awl.weekly_mm_sp4 + awl.weekly_mm_sp5 + awl.weekly_mm_sp6 + awl.weekly_mm_sp7 + awl.weekly_mm_sp8 + awl.weekly_mm_sp9 + awl.weekly_mm_sp10 + awl.weekly_mm_sp11 AS total_weekly_mm_sp
	FROM all_week_leaderboard awl
	)
/*TOTAL_WEEK_LEADERBOARD (TWL) shows total wins, matchmade entries, and SP for weeks 1-11.*/
	,weekly_challenge_1
AS (
	SELECT DISTINCT tlw1.team_id
		,tlw1.name
		,tlw1.weekly_entries
		,CASE
			WHEN tlw1.weekly_entries >= 70
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_leaderboard_week_1 tlw1
	)
/*WEEKLY_CHALLENGE_1 (WC1) grants SP for a team surpassing 70 games played in week 1.*/
	,weekly_challenge_2
AS (
	SELECT DISTINCT tptw2.team_id
		,tptw2.total_pts
		,CASE
			WHEN tptw2.total_pts >= 1000 --2500 S3
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_player_totals_week_2 tptw2
	WHERE tptw2.row = 1
	)
/*WEEKLY_CHALLENGE_2 (WC2) grants SP for a player surpassing 1,000 points in week 2.*/
	,weekly_challenge_3
AS (
	SELECT DISTINCT gbssw3.team_id
		--,gbssw3.name
		,gbssw3.total_blk
		,CASE
			WHEN gbssw3.total_blk >= 250
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM game_box_score_sum_week_3 gbssw3
	)
/*WEEKLY_CHALLENGE_3 (WC3) grants SP for a team surpassing 250 blocks in week 3.*/
	,weekly_challenge_4
AS (
	SELECT DISTINCT tptw4.team_id
		,tptw4.total_trb
		,CASE
			WHEN tptw4.total_trb >= 350 --1250 S3
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_player_totals_week_4 tptw4
	WHERE tptw4.row = 1
	)
/*WEEKLY_CHALLENGE_4 (WC4) grants SP for a player surpassing 350 total rebounds in week 4.*/
	,weekly_challenge_5
AS (
	SELECT DISTINCT gbssw5.team_id
		,gbssw5.total_ast
		,CASE
			WHEN gbssw5.total_ast >= 1750 --1000
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM game_box_score_sum_week_5 gbssw5
	)
/*WEEKLY_CHALLENGE_5 (WC5) grants SP for a team surpassing 1,750 assists played in week 5.*/
	,weekly_challenge_6
AS (
	SELECT DISTINCT tptw6.team_id
		,tptw6.total_blk
		,CASE
			WHEN tptw6.total_blk >= 150 --70
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_player_totals_week_6 tptw6
	WHERE tptw6.row = 1
	)
/*WEEKLY_CHALLENGE_6 (WC6) grants SP for a player surpassing 150 blocks in week 6.*/
	,weekly_challenge_7
AS (
	SELECT DISTINCT tlw7.team_id
		,tlw7.name
		,tlw7.weekly_entries
		,CASE
			WHEN tlw7.weekly_entries >= 100
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_leaderboard_week_7 tlw7
	)
/*WEEKLY_CHALLENGE_7 (WC7) grants SP for a team surpassing 100 games played in week 7.*/
	,weekly_challenge_8
AS (
	SELECT DISTINCT tptw8.team_id
		,tptw8.total_ast
		,CASE
			WHEN tptw8.total_ast >= 650 --350
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_player_totals_week_8 tptw8
	WHERE tptw8.row = 1
	)
/*WEEKLY_CHALLENGE_8 (WC8) grants SP for a player surpassing 650 assists in week 8.*/
	,weekly_challenge_9
AS (
	SELECT DISTINCT gbssw9.team_id
		,gbssw9.total_stl
		,CASE
			WHEN gbssw9.total_stl >= 500
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM game_box_score_sum_week_9 gbssw9
	)
/*WEEKLY_CHALLENGE_9 (WC9) grants SP for a team surpassing 500 steals in week 9.*/
	,weekly_challenge_10
AS (
	SELECT DISTINCT tptw10.team_id
		,tptw10.total_three_p
		,CASE
			WHEN tptw10.total_three_p >= 350 --140
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM team_player_totals_week_10 tptw10
	WHERE tptw10.row = 1
	)
/*WEEKLY_CHALLENGE_10 (WC10) grants SP for a player surpassing 350 3 pointers made in week 10.*/
	,weekly_challenge_11
AS (
	SELECT DISTINCT gbssw11.team_id
		,gbssw11.total_pts
		,CASE
			WHEN gbssw11.total_pts >= 7500 --7000
				THEN 100
			ELSE 0
			END AS weekly_challenge_sp
	FROM game_box_score_sum_week_11 gbssw11
	)
/*WEEKLY_CHALLENGE_11 (WC11) grants SP for a team surpassing 7,500 points in week 11.*/
/*MAIN QUERY*/
SELECT gtfl.team_id
	,gtfl.name
	,gtfl.email
	,gtfl.date_joined
	,COALESCE(ttl.total_daily_sp, 0) + COALESCE(twl.total_weekly_sp, 0) + COALESCE(twl.total_weekly_mm_sp, 0) + COALESCE(tst.total_tourney_sp, 0) + COALESCE(wc1.weekly_challenge_sp, 0) + COALESCE(wc2.weekly_challenge_sp, 0) + COALESCE(wc3.weekly_challenge_sp, 0) + COALESCE(wc4.weekly_challenge_sp, 0) + COALESCE(wc5.weekly_challenge_sp, 0) + COALESCE(wc6.weekly_challenge_sp, 0) + COALESCE(wc7.weekly_challenge_sp, 0) + COALESCE(wc8.weekly_challenge_sp, 0) + COALESCE(wc9.weekly_challenge_sp, 0) + COALESCE(wc10.weekly_challenge_sp, 0) + COALESCE(wc11.weekly_challenge_sp, 0) AS total_sp
	,COALESCE(te.earnings, 0) AS earnings
	,SUM((gtfl.own_score > gtfl.opponent_score)::INT) AS wins
	,SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS losses
	,COUNT(gtfl.*) AS played
	,COALESCE(COUNT(gtfl.*) FILTER(WHERE gtfl.created_at >= ((CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE + INTERVAL '00:00:00')), 0) AS played_today
	,COALESCE(COUNT(gtfl.*) FILTER(WHERE gtfl.created_at >= DATE_TRUNC('week', (CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE) + INTERVAL '00:00:00'), 0) AS played_this_week
	,COALESCE(SUM((gtfl.own_score > gtfl.opponent_score)::INT) FILTER(WHERE gtfl.created_at >= DATE_TRUNC('week', (CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE) + INTERVAL '00:00:00'), 0) AS won_this_week
	,COALESCE(COUNT(gtfl.*) FILTER(WHERE gtfl.created_at >= DATE_TRUNC('week', (CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE) + INTERVAL '00:00:00' AND gtfl.game_kind = 'HEAD_TO_HEAD_MATCH_MAKE'), 0) AS mm_games_this_week
	,COALESCE(wc2.total_pts, 0) AS rotating_player_points --1k
	,COALESCE(wc3.total_blk, 0) AS rotating_team_blocks --250
	,COALESCE(wc4.total_trb, 0) AS rotating_player_rebounds --350
	,COALESCE(wc5.total_ast, 0) AS rotating_team_assists --1k
	,COALESCE(wc6.total_blk, 0) AS rotating_player_blocks --70
	,COALESCE(wc8.total_ast, 0) AS rotating_player_assists --350
	,COALESCE(wc9.total_stl, 0) AS rotating_team_steals --500
	,COALESCE(wc10.total_three_p, 0) AS rotating_player_three_p --150
	,COALESCE(wc11.total_pts, 0) AS rotating_team_points --7k
FROM game_team_full_lineups gtfl
/*LEFT JOIN team_player_totals_week2 tptw2 ON gtfl.team_id = tptw2.team_id
LEFT JOIN team_player_totals_week4 tptw4 ON gtfl.team_id = tptw4.team_id
LEFT JOIN game_box_score_sum_week3 gbssw3 ON gtfl.team_id = gbssw3.team_id*/
INNER JOIN total_team_leaderboard ttl ON gtfl.team_id = ttl.team_id
INNER JOIN total_week_leaderboard twl ON gtfl.team_id = twl.team_id
LEFT JOIN tourney_sp_totals tst ON gtfl.team_id = tst.team_id
LEFT JOIN weekly_challenge_1 wc1 ON gtfl.team_id = wc1.team_id
LEFT JOIN weekly_challenge_2 wc2 ON gtfl.team_id = wc2.team_id
LEFT JOIN weekly_challenge_3 wc3 ON gtfl.team_id = wc3.team_id
LEFT JOIN weekly_challenge_4 wc4 ON gtfl.team_id = wc4.team_id
LEFT JOIN weekly_challenge_5 wc5 ON gtfl.team_id = wc5.team_id
LEFT JOIN weekly_challenge_6 wc6 ON gtfl.team_id = wc6.team_id
LEFT JOIN weekly_challenge_7 wc7 ON gtfl.team_id = wc7.team_id
LEFT JOIN weekly_challenge_8 wc8 ON gtfl.team_id = wc8.team_id
LEFT JOIN weekly_challenge_9 wc9 ON gtfl.team_id = wc9.team_id
LEFT JOIN weekly_challenge_10 wc10 ON gtfl.team_id = wc10.team_id
LEFT JOIN weekly_challenge_11 wc11 ON gtfl.team_id = wc11.team_id
LEFT JOIN team_earnings te ON gtfl.team_id = te.team_id
--WHERE gtfl.team_id = %(team_id)s
GROUP BY gtfl.team_id
	,gtfl.name
	,gtfl.email
	,gtfl.date_joined
	,COALESCE(ttl.total_daily_sp, 0) + COALESCE(twl.total_weekly_sp, 0) + COALESCE(twl.total_weekly_mm_sp, 0) + COALESCE(tst.total_tourney_sp, 0) + COALESCE(wc1.weekly_challenge_sp, 0) + COALESCE(wc2.weekly_challenge_sp, 0) + COALESCE(wc3.weekly_challenge_sp, 0) + COALESCE(wc4.weekly_challenge_sp, 0) + COALESCE(wc5.weekly_challenge_sp, 0) + COALESCE(wc6.weekly_challenge_sp, 0) + COALESCE(wc7.weekly_challenge_sp, 0) + COALESCE(wc8.weekly_challenge_sp, 0) + COALESCE(wc9.weekly_challenge_sp, 0) + COALESCE(wc10.weekly_challenge_sp, 0) + COALESCE(wc11.weekly_challenge_sp, 0)
	,COALESCE(te.earnings, 0)
	,COALESCE(wc2.total_pts, 0)
	,COALESCE(wc3.total_blk, 0)
	,COALESCE(wc4.total_trb, 0)
	,COALESCE(wc5.total_ast, 0)
	,COALESCE(wc6.total_blk, 0)
	,COALESCE(wc8.total_ast, 0)
	,COALESCE(wc9.total_stl, 0)
	,COALESCE(wc10.total_three_p, 0)
	,COALESCE(wc11.total_pts, 0)
ORDER BY gtfl.team_id;
/*The main query aggregates stats at the team level.*/

-- Create index on team_id because (1) we query by it and (2) we need this for
-- applying the 'CONCURRENTLY' param when refreshing the materialized view
CREATE UNIQUE INDEX ON view_current_season_team_sp (team_id);
