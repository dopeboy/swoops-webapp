/*GAME_CONTEST captures contest id, contest status, contest type, and when it was played.
For each contest id, GAME_GAME captures lineup 1 id, lineup 2 id, and prize pool amount.
GAME_LINEUP takes the lineup id from GAME_GAME and tells us the player ids in the lineup along with their team's id.
ACCOUNTS_USER gives us additional details of each team.
SIMULATION_SIMULATION provides the result id needed to find contest outcomes.
SIMULATION_RESULT shows contest results with ids for players' box scores.

GAME_LEVEL_BASE (GLB) provides info on the contest level.
GAME_TEAM_BASE UNIONS (GTB) and consolidates team 1 and team 2 details from the contest level into agnostic team and lineup fields.
LINEUP_PREP (LP) shows lineup details by team.
GAME_TEAM_FULL_LINEUPS (GTFL) normalizes all contest details at the individual team perspective.
GAME_RESULT_BASE (GRB) returns contest results and streak types for all completed games PARTITIONED by team id and ORDERED by played time DESC.
GAME_TEAM_LEADERBOARD (GTL) aggregates and shows entries with XP by day.
GAME_TEAM_LEADERBOARD_ADJUSTMENT_1 (GTLA1) grants full SP to all users who did not 5 hit games.
TOTAL_TEAM_LEADERBOARD (TTL) shows total entries and daily XP on team level.
WEEK_TEAM_LEADERBOARD_1 (WTL1) shows total wins on team level for week 1.
WEEK_TEAM_LEADERBOARD_2 (WTL2) shows total wins on team level for week 2
WEEK_TEAM_LEADERBOARD_3 (WTL3) shows total wins on team level for week 3.
WEEK_TEAM_LEADERBOARD_3 (WTL4) shows total wins on team level for week 4.
WEEK_TEAM_LEADERBOARD_3 (WTL5) shows total wins on team level for week 5.
WEEK_TEAM_LEADERBOARD_3 (WTL6) shows total wins on team level for week 6.
WEEK_TEAM_LEADERBOARD_3 (WTL7) shows total wins on team level for week 7.
WEEK_TEAM_LEADERBOARD_3 (WTL8) shows total wins on team level for week 8.
WEEK_TEAM_LEADERBOARD_3 (WTL9) shows total wins on team level for week 9.
WEEK_TEAM_LEADERBOARD_3 (WTL10) shows total wins on team level for week 10.
WEEK_TEAM_LEADERBOARD_3 (WTL11) shows total wins on team level for week 11.
ALL_WEEK_LEADERBOARD (AWL) shows wins and SP for each of weeks 1-11.
TOTAL_WEEK_LEADERBOARD (TWL) shows total wins and SP for weeks 1-11.
GAME_TEAM_LEADERBOARD_ADJUSTMENT_1 (GTLA1) grants full SP to all users who did not 5 hit games.

The main query aggregates stats at the team level.*/

WITH game_level_base
AS (
	SELECT gg.id
		,gg.contest_id
		,(ss.created_at - INTERVAL '4 hours') AS created_at
		--,(gc.played_at - INTERVAL '4 hours') AS played_at
		,gg.simulation_id
		,gc.tokens_required
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
	WHERE ss.created_at >= 'May 31, 2023 5:00 PM'
		AND (ss.created_at - INTERVAL '4 hours')::DATE <= NOW()
		AND gc.status = 'COMPLETE'
	)
/*GAME_LEVEL_BASE (GLB) provides info on the contest level.*/
	,game_team_base
AS (
	(
		SELECT glb.id
			,glb.contest_id
			,glb.created_at
			--,glb.played_at
			,glb.simulation_id
			,glb.tokens_required	   
			,glb.result_id
			,glb.prize_pool
			,glb.lineup_1_id AS lineup_id
			,glb.lineup_1_score AS own_score
			,glb.lineup_2_score AS opponent_score
		FROM game_level_base glb
		)
	
	UNION ALL
	
	(
		SELECT glb.id
			,glb.contest_id
			,glb.created_at
			--,glb.played_at
			,glb.simulation_id
			,glb.tokens_required	
			,glb.result_id
			,glb.prize_pool
			,glb.lineup_2_id AS lineup_id
			,glb.lineup_2_score AS own_score
			,glb.lineup_1_score AS opponent_score
		FROM game_level_base glb
		)
	)
/*GAME_TEAM_BASE (GTB) UNIONS and consolidates team 1 and team 2 details from the contest level into agnostic team and lineup fields.*/
	,lineup_prep
AS (
	SELECT gl.id AS lineup_id
		,gl.team_id
		,gt.name
		,LOWER(au.email) email
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
	FROM game_lineup gl
	INNER JOIN game_team gt ON gl.team_id = gt.id
	INNER JOIN accounts_user au ON gt.owner_id = au.id
	)
/*LINEUP_PREP (LP) shows lineup details by team.*/
	,game_team_full_lineups
AS (
	SELECT gtb.id
		,gtb.contest_id
		,gtb.created_at
		--,gtb.played_at
		,gtb.simulation_id
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
	FROM game_team_base gtb
	INNER JOIN lineup_prep lp ON gtb.lineup_id = lp.lineup_id
	)
/*GAME_TEAM_FULL_LINEUPS (GTFL) normalizes all contest details at the individual team perspective.*/
	,game_result_base
AS (
	SELECT ROW_NUMBER() OVER (
			PARTITION BY gtfl.team_id ORDER BY gtfl.created_at DESC
			) AS ROW
		,gtfl.team_id
		,gtfl.name
		,gtfl.email
		,gtfl.date_joined
		,gtfl.created_at::DATE AS date
		,gtfl.created_at
		,gtfl.contest_id
		,CASE
			WHEN gtfl.own_score > gtfl.opponent_score
				THEN 1
			ELSE 0
			END AS team_result
		,CASE
			WHEN gtfl.own_score > gtfl.opponent_score
				THEN 'W'
			ELSE 'L'
			END AS streak_type
		,gtfl.logo
		,gtfl.logo_url
		,gtfl.wallet
		,gtfl.locker
		,gtfl.etherscan
	FROM game_team_full_lineups gtfl
	)
/*GAME_RESULT_BASE (GRB) returns contest results and streak types for all completed games PARTITIONED by team id and ORDERED by played time DESC.*/
	,game_team_leaderboard
AS (
	SELECT gtfl.team_id
		,gtfl.name
		,gtfl.email
		,gtfl.date_joined
		,gtfl.created_at::DATE AS created_at
		,SUM((gtfl.own_score > gtfl.opponent_score)::INT) AS wins
		,SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS losses
		,SUM((gtfl.own_score > gtfl.opponent_score)::INT) + SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS entries
		,CASE
			WHEN SUM((gtfl.own_score > gtfl.opponent_score)::INT) + SUM((gtfl.own_score < gtfl.opponent_score)::INT) >= 5
				THEN 150
			ELSE 0
			END AS daily_sp
		/*,(SUM((gtfl.own_score > gtfl.opponent_score)::INT) / NULLIF(CAST(COUNT(*) AS DECIMAL(10, 4)), 0) * 100) AS win_percentage
		,AVG(gtfl.own_score) AS ppg
		,AVG(gtfl.opponent_score) AS opp_ppg
		,AVG(gtfl.own_score - gtfl.opponent_score) AS diff
		,gtfl.logo
		,gtfl.wallet
		,gtfl.locker*/
	FROM game_team_full_lineups gtfl
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
	,game_team_leaderboard_adjustment_1
AS (
	SELECT DISTINCT gtl.team_id
		,gtl.name
		,gtl.email
		,gtl.date_joined
		,150 AS sp_adjust
	FROM game_team_leaderboard gtl
	WHERE gtl.team_id IN (11, 16, 17, 20, 26, 30, 38, 39, 52, 53, 85, 88, 94, 99, 100, 105, 113, 116, 132, 135, 139, 147, 149, 157, 171, 176, 182, 195, 197, 199, 211, 223, 225, 269, 276, 288, 306, 311, 314, 369, 433, 444, 474, 496, 500, 539, 541, 544, 614, 640, 643, 666, 712, 718, 736, 766, 770, 771, 779, 785, 795, 807, 812, 828, 847, 856, 872, 873, 879, 894, 896, 898, 904, 905, 911, 912, 913, 922, 923, 925, 928, 930, 932, 934, 935, 940, 941, 942, 945, 949, 953, 958, 960, 963, 965, 969, 970, 971, 975, 976, 978, 983, 985, 987, 991, 992, 993, 1008, 1013, 1017, 1020, 1023, 1026, 1030, 1036, 1038, 1051, 1052, 1053, 1058, 1059, 1062, 1063, 1070, 1084, 1089, 1092, 4, 297, 373, 408, 518, 667, 728, 735, 741, 938, 939, 954, 1057, 1066, 1093)
	)
/*GAME_TEAM_LEADERBOARD_ADJUSTMENT_1 (GTLA1) grants full SP to all users who did not 5 hit games.*/
	,total_team_leaderboard
AS (
	SELECT gtl.team_id
		,gtl.name
		,gtl.email
		,gtl.date_joined
		,SUM(gtl.wins) AS total_wins
		,SUM(gtl.losses) AS total_losses
		,SUM(gtl.entries) AS total_entries
		,SUM(gtl.daily_sp) AS total_daily_sp
	FROM game_team_leaderboard gtl
	GROUP BY gtl.team_id
		,gtl.name
		,gtl.email
		,gtl.date_joined
	ORDER BY gtl.team_id
	)
/*TOTAL_TEAM_LEADERBOARD (TTL) shows total entries and daily XP on team level.*/
	,week_team_leaderboard_1
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'May 31, 2023'
	    AND 'June 4, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_1 (WTL1) shows total wins on team level for week 1.*/
	,week_team_leaderboard_2
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'June 5, 2023'
	    AND 'June 11, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_2 (WTL2) shows total wins on team level for week 2.*/
	,week_team_leaderboard_3
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'June 12, 2023'
	    AND 'June 18, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_3 (WTL3) shows total wins on team level for week 3.*/
	,week_team_leaderboard_4
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'June 19, 2023'
	    AND 'June 25, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_4 (WTL4) shows total wins on team level for week 4.*/
	,week_team_leaderboard_5
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'June 26, 2023'
	    AND 'July 2, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_5 (WTL5) shows total wins on team level for week 5.*/
	,week_team_leaderboard_6
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'July 3, 2023'
	    AND 'July 9, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_6 (WTL6) shows total wins on team level for week 6.*/
	,week_team_leaderboard_7
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'July 10, 2023'
	    AND 'July 16, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_7 (WTL7) shows total wins on team level for week 7.*/
	,week_team_leaderboard_8
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'July 17, 2023'
	    AND 'July 23, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_8 (WTL8) shows total wins on team level for week 8.*/
	,week_team_leaderboard_9
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'July 24, 2023'
	    AND 'July 30, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_9 (WTL9) shows total wins on team level for week 9.*/
	,week_team_leaderboard_10
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'July 31, 2023'
	    AND 'August 6, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_10 (WTL10) shows total wins on team level for week 10.*/
	,week_team_leaderboard_11
AS (
	SELECT gtl.team_id
		,gtl.name
		,SUM(gtl.wins) AS weekly_wins
	FROM game_team_leaderboard gtl
	WHERE gtl.created_at::DATE BETWEEN 'August 7, 2023'
	    AND 'August 13, 2023'
	GROUP BY gtl.team_id
		,gtl.name
	)
/*WEEK_TEAM_LEADERBOARD_11 (WTL11) shows total wins on team level for week 11.*/
	,all_week_leaderboard
AS (
	SELECT DISTINCT gtfl.team_id
		,gtfl.name
		,COALESCE(wtl1.weekly_wins, 0) AS weekly_wins1
		,COALESCE(wtl2.weekly_wins, 0) AS weekly_wins2
		,COALESCE(wtl3.weekly_wins, 0) AS weekly_wins3
		,COALESCE(wtl4.weekly_wins, 0) AS weekly_wins4
		,COALESCE(wtl5.weekly_wins, 0) AS weekly_wins5
		,COALESCE(wtl6.weekly_wins, 0) AS weekly_wins6
		,COALESCE(wtl7.weekly_wins, 0) AS weekly_wins7
		,COALESCE(wtl8.weekly_wins, 0) AS weekly_wins8
		,COALESCE(wtl9.weekly_wins, 0) AS weekly_wins9
		,COALESCE(wtl10.weekly_wins, 0) AS weekly_wins10
		,COALESCE(wtl11.weekly_wins, 0) AS weekly_wins11
		,CASE
			WHEN wtl1.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp1
		,CASE
			WHEN wtl2.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp2
		,CASE
			WHEN wtl3.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp3
		,CASE
			WHEN wtl4.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp4
		,CASE
			WHEN wtl5.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp5
		,CASE
			WHEN wtl6.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp6
		,CASE
			WHEN wtl7.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp7
		,CASE
			WHEN wtl8.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp8
		,CASE
			WHEN wtl9.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp9
		,CASE
			WHEN wtl10.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp10
		,CASE
			WHEN wtl11.weekly_wins >= 25
				THEN 75
			ELSE 0
			END AS weekly_sp11
	FROM game_team_full_lineups gtfl
	LEFT JOIN week_team_leaderboard_1 wtl1 ON gtfl.team_id = wtl1.team_id
	LEFT JOIN week_team_leaderboard_2 wtl2 ON gtfl.team_id = wtl2.team_id
	LEFT JOIN week_team_leaderboard_3 wtl3 ON gtfl.team_id = wtl3.team_id
	LEFT JOIN week_team_leaderboard_4 wtl4 ON gtfl.team_id = wtl4.team_id
	LEFT JOIN week_team_leaderboard_5 wtl5 ON gtfl.team_id = wtl5.team_id
	LEFT JOIN week_team_leaderboard_6 wtl6 ON gtfl.team_id = wtl6.team_id
	LEFT JOIN week_team_leaderboard_7 wtl7 ON gtfl.team_id = wtl7.team_id
	LEFT JOIN week_team_leaderboard_8 wtl8 ON gtfl.team_id = wtl8.team_id
	LEFT JOIN week_team_leaderboard_9 wtl9 ON gtfl.team_id = wtl9.team_id
	LEFT JOIN week_team_leaderboard_10 wtl10 ON gtfl.team_id = wtl10.team_id
	LEFT JOIN week_team_leaderboard_11 wtl11 ON gtfl.team_id = wtl11.team_id
	)
/*ALL_WEEK_LEADERBOARD (AWL) shows wins and SP for each of weeks 1-11.*/
	,total_week_leaderboard
AS (
	SELECT awl.team_id
		,awl.name
		,awl.weekly_wins1 + awl.weekly_wins2 + awl.weekly_wins3 + awl.weekly_wins4 + awl.weekly_wins5 + awl.weekly_wins6 + awl.weekly_wins7 + awl.weekly_wins8 + awl.weekly_wins9 + awl.weekly_wins10 + awl.weekly_wins11 AS total_weekly_wins
		,awl.weekly_sp1 + awl.weekly_sp2 + awl.weekly_sp3 + awl.weekly_sp4 + awl.weekly_sp5 + awl.weekly_sp6 + awl.weekly_sp7 + awl.weekly_sp8 + awl.weekly_sp9 + awl.weekly_sp10 + awl.weekly_sp11 AS total_weekly_sp
	FROM all_week_leaderboard awl
	)
/*TOTAL_WEEK_LEADERBOARD (TWL) shows total wins and SP for weeks 1-11.*/
SELECT gtfl.team_id
	,gtfl.name
	,gtfl.email
	,gtfl.date_joined
	,ttl.total_daily_sp + twl.total_weekly_sp + COALESCE(gtla1.sp_adjust, 0) AS total_sp
	,SUM((gtfl.own_score > gtfl.opponent_score)::INT) AS wins
	,SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS losses
	,SUM((gtfl.own_score > gtfl.opponent_score)::INT) + SUM((gtfl.own_score < gtfl.opponent_score)::INT) AS entries
	,(SUM((gtfl.own_score > gtfl.opponent_score)::INT) / NULLIF(CAST(COUNT(*) AS DECIMAL(10, 4)), 0) * 100) AS win_percentage
	,AVG(gtfl.own_score) AS ppg
	,AVG(gtfl.opponent_score) AS opp_ppg
	,AVG(gtfl.own_score - gtfl.opponent_score) AS diff
	,COUNT(gtfl.*) AS played
	,COUNT(gtfl.*) FILTER(WHERE gtfl.created_at >= ((CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE + INTERVAL '00:00:01')) AS played_today
	,SUM((gtfl.own_score > gtfl.opponent_score)::INT) FILTER(WHERE gtfl.created_at >= DATE_TRUNC('week', (CURRENT_TIMESTAMP - INTERVAL '4 hours')::DATE) + INTERVAL '00:00:01') AS won_this_week
	,gtfl.logo
	,gtfl.logo_url
	,gtfl.wallet
	,gtfl.locker
	,gtfl.etherscan
FROM game_team_full_lineups gtfl
INNER JOIN total_team_leaderboard ttl ON gtfl.team_id = ttl.team_id
INNER JOIN total_week_leaderboard twl ON gtfl.team_id = twl.team_id
LEFT JOIN game_team_leaderboard_adjustment_1 gtla1 ON gtfl.team_id = gtla1.team_id
WHERE ttl.team_id = %(team_id)s
GROUP BY gtfl.team_id
	,gtfl.name
	,gtfl.email
	,gtfl.date_joined
	,ttl.total_daily_sp + twl.total_weekly_sp + COALESCE(gtla1.sp_adjust, 0)
	,gtfl.logo
	,gtfl.logo_url
	,gtfl.wallet
	,gtfl.locker
	,gtfl.etherscan
ORDER BY ttl.total_daily_sp + twl.total_weekly_sp + COALESCE(gtla1.sp_adjust, 0) DESC
	,SUM((gtfl.own_score > gtfl.opponent_score)::INT) / NULLIF(CAST(COUNT(*) AS DECIMAL(10, 4)), 0) DESC
	--,SUM((gtfl.own_score > gtfl.opponent_score)::INT) DESC
	,AVG(gtfl.own_score - gtfl.opponent_score) DESC
/*The main query aggregates stats at the team level.*/
