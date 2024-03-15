/*GAME_CONTEST captures contest id, contest status, contest type, and when it was played.
GAME_LEVEL_BASE provides info on the contest level.
GAME_TEAM_BASE UNIONS and consolidates team 1 and team 2 details from the contest level into agnostic team and lineup fields.
GAME_LINEUP_PREP UNIONS and consolidates players from the lineup level into agnostic player fields while hardcoding their lineup slots.
SIM_LINEUP_PREP UNIONS and consolidates lineup and player details from the contest level into agnostic lineup and player fields while
hardcoding their lineup slots.
GAME_BOX_SCORE_PREP shows player details and box scores from each contest lineup.
GAME_BOX_SCORE_SUM shows aggregate player details from all games played.
PLAYER_OWNER_DETAILS (POD) shows players' current team details.
The main query averages stats at the player level.

IMPORTANT NOTE: Contest id reflects the order of when a contest was created rather than when a contest was completed. Played at tells us
the timestamp (and order) of completed games*/

WITH game_level_base
AS (
	SELECT gg.contest_id
		,gc.played_at
		,gg.simulation_id
		,ss.result_id
		,gg.prize_pool
		,gg.lineup_1_id
		,gg.lineup_2_id
		,sr.lineup_1_score
		,sr.lineup_2_score
	FROM game_game gg
	INNER JOIN game_contest gc ON gg.contest_id = gc.id
	INNER JOIN simulator_simulation ss ON gg.simulation_id = ss.id
	INNER JOIN simulator_result sr ON ss.result_id = sr.id
	WHERE gc.played_at >= '2023-05-31 17:00:00'
		AND gc.played_at::DATE <= NOW()
		AND gc.status = 'COMPLETE'
	)
/*GAME_LEVEL_BASE (GLB) provides info on the contest level.*/
	,game_team_base
AS (
	(
		SELECT glb.contest_id
			,glb.played_at
			,glb.simulation_id
			,glb.result_id
			,glb.prize_pool
			,glb.lineup_1_id AS lineup_id
			,glb.lineup_1_score AS own_score
			,glb.lineup_2_score AS opponent_score
		FROM game_level_base glb
		)

	UNION ALL

	(
		SELECT glb.contest_id
			,glb.played_at
			,glb.simulation_id
			,glb.result_id
			,glb.prize_pool
			,glb.lineup_2_id AS lineup_id
			,glb.lineup_2_score AS own_score
			,glb.lineup_1_score AS opponent_score
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
/*GAME_LINEUP_PREP (GLP) UNIONS and consolidates players from the lineup level into agnostic player fields while hardcoding their lineup slots.
SIM_LINEUP_PREP (SLP) then JOINS on the player id and lineup spot.*/
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
	,game_box_score_prep
AS (
	SELECT gtb.contest_id
		,gtb.played_at::DATE AS played_at
		/*,gtb.simulation_id
		,gtb.prize_pool
		,gtb.own_score
		,gtb.opponent_score*/
		,glp.team_id
		/*,gtb.lineup_id*/
		,gp.id
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
	FROM game_team_base gtb
	INNER JOIN game_lineup_prep glp ON gtb.lineup_id = glp.id
	INNER JOIN game_player gp ON glp.player_id = gp.id
		--AND glp.team_id = gp.team_id (checks to see if player is still on team)
	INNER JOIN simulator_player sp ON gp.simulated_id = sp.uuid
	INNER JOIN sim_lineup_prep slp ON gtb.result_id = slp.id
		AND glp.lineup_spot = slp.lineup_spot
		AND gtb.own_score = slp.lineup_score
	INNER JOIN simulator_boxscore sb ON slp.player_box_score_id = sb.id
	/*WHERE gtb.contest_id = ?
		AND glp.team_id = ?
		AND gtb.played_at::DATE BETWEEN (CURRENT_DATE - ?)
			AND (CURRENT_DATE - ?)*/
	ORDER BY gtb.contest_id
		,gtb.lineup_id
		,glp.lineup_spot
	)
/*GAME_BOX_SCORE_PREP (GBSP) shows player details and box scores from each contest lineup.*/
	,game_box_score_sum
AS (
	SELECT gbsp.id
		,gbsp.token
		,gbsp.full_name
		,gbsp.canonical
		,gbsp.positions
		,gbsp.age
		,gbsp.star_rating
		,COUNT(gbsp.contest_id) AS games_played
		,SUM(gbsp.wins) AS wins
		,COUNT(gbsp.contest_id) - SUM(gbsp.wins) AS losses
		,SUM(gbsp.pts) AS total_pts
		,SUM(gbsp.pts) / NULLIF(CAST(COUNT(gbsp.contest_id) AS DECIMAL(10, 4)), 0) AS ppg
		,SUM(gbsp.pts) / (2 * (SUM(gbsp.fga) + (.44 * SUM(gbsp.fta)))) * 100 AS ts_pct
		,(SUM(gbsp.fg) + (.5 * SUM(gbsp.three_p))) / NULLIF(CAST(SUM(gbsp.fga) AS DECIMAL(10, 4)), 0) * 100 AS efg_pct
		,SUM(gbsp.fg) AS total_fg
		,SUM(gbsp.fga) AS total_fga
		,SUM(gbsp.fg) / NULLIF(CAST(SUM(gbsp.fga) AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
		,SUM(gbsp.two_p) AS total_two_p
		,SUM(gbsp.two_pa) AS total_two_pa
		,SUM(gbsp.two_p) / NULLIF(CAST(SUM(gbsp.two_pa) AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
		,SUM(gbsp.three_p) AS total_three_p
		,SUM(gbsp.three_pa) AS total_three_pa
		,SUM(gbsp.three_p) / NULLIF(CAST(SUM(gbsp.three_pa) AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
		,SUM(gbsp.ft) AS total_ft
		,SUM(gbsp.fta) AS total_fta
		,SUM(gbsp.ft) / NULLIF(CAST(SUM(gbsp.fta) AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
		,SUM(gbsp.orb) AS total_orb
		,SUM(gbsp.drb) AS total_drb
		,SUM(gbsp.trb) AS total_trb
		,SUM(gbsp.ast) AS total_ast
		,SUM(gbsp.stl) AS total_stl
		,SUM(gbsp.blk) AS total_blk
		,SUM(gbsp.tov) AS total_tov
		,SUM(gbsp.pf) AS total_pf
	FROM game_box_score_prep gbsp
	GROUP BY gbsp.id
		,gbsp.token
		,gbsp.full_name
		,gbsp.canonical
		,gbsp.positions
		,gbsp.age
		,gbsp.star_rating
	ORDER BY gbsp.full_name
	)
/*GAME_BOX_SCORE_SUM (GBSS) shows aggregate player details from all games played.*/
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
SELECT gbss.id
	,gbss.token
	,gbss.full_name
	,gbss.canonical
	,gbss.positions
	,gbss.age
	,gbss.star_rating
	,gbss.games_played
	,gbss.wins
	,gbss.losses
	,gbss.wins / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) * 100 AS percentage_wins
	,gbss.losses / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) * 100 AS percentage_losses
	,gbss.ppg
	--,gbss.total_pts / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS ppg
	,gbss.ts_pct
	,gbss.efg_pct
	,gbss.total_fg / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS fg
	,gbss.total_fga / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS fga
	,gbss.fg_pct
	--,gbss.total_fg / NULLIF(CAST(gbss.total_fga AS DECIMAL(10, 4)), 0) * 100 AS fg_pct
	,gbss.total_two_p / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS two_p
	,gbss.total_two_pa / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS two_pa
	,gbss.two_p_pct
	--,gbss.total_two_p / NULLIF(CAST(gbss.total_two_pa AS DECIMAL(10, 4)), 0) * 100 AS two_p_pct
	,gbss.total_three_p / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS three_p
	,gbss.total_three_pa / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS three_pa
	,gbss.three_p_pct
	--,gbss.total_three_p / NULLIF(CAST(gbss.total_three_pa AS DECIMAL(10, 4)), 0) * 100 AS three_p_pct
	,gbss.total_ft / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS ft
	,gbss.total_fta / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS fta
	,gbss.ft_pct
	--,gbss.total_ft / NULLIF(CAST(gbss.total_fta AS DECIMAL(10, 4)), 0) * 100 AS ft_pct
	,gbss.total_orb / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS orpg
	,gbss.total_drb / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS drpg
	,gbss.total_trb / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS rpg
	,gbss.total_ast / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS apg
	,gbss.total_stl / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS spg
	,gbss.total_blk / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS bpg
	,gbss.total_tov / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0)AS tpg
	,gbss.total_pf / NULLIF(CAST(gbss.games_played AS DECIMAL(10, 4)), 0) AS fpg
	,pod.team_id
	,pod.name
	,pod.email
	,pod.locker
FROM game_box_score_sum gbss
LEFT JOIN player_owner_details pod ON gbss.id = pod.id
ORDER BY gbss.ppg
/*The main query averages stats at the player level.*/
