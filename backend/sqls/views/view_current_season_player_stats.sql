CREATE MATERIALIZED VIEW IF NOT EXISTS view_current_season_player_stats AS
SELECT pgs.player_id,
       COUNT(*)                            AS count,
       COUNT(*) FILTER (WHERE pgs.won)     AS wins,
       COUNT(*) FILTER (WHERE NOT pgs.won) AS losses,
       AVG(pgs.fg)                         AS fg,
       AVG(pgs.ft)                         AS ft,
       AVG(pgs.pf)                         AS fpg,
       AVG(pgs.ast)                        AS apg,
       AVG(pgs.blk)                        AS bpg,
       AVG(pgs.drb)                        AS drpg,
       AVG(pgs.fga)                        AS fga,
       AVG(pgs.fta)                        AS fta,
       AVG(pgs.orb)                        AS orpg,
       AVG(pgs.pts)                        AS ppg,
       AVG(pgs.stl)                        AS spg,
       AVG(pgs.tov)                        AS tpg,
       AVG(pgs.trb)                        AS rpg,
       AVG(pgs.two_p)                      AS two_p,
       AVG(pgs.two_pa)                     AS two_pa,
       AVG(pgs.three_p)                    AS three_p,
       AVG(pgs.three_pa)                   AS three_pa,
       SUM(pgs.fg)                         AS fg_total,
       SUM(pgs.ft)                         AS ft_total,
       SUM(pgs.pf)                         AS fpg_total,
       SUM(pgs.ast)                        AS apg_total,
       SUM(pgs.blk)                        AS bpg_total,
       SUM(pgs.drb)                        AS drpg_total,
       SUM(pgs.fga)                        AS fga_total,
       SUM(pgs.fta)                        AS fta_total,
       SUM(pgs.orb)                        AS orpg_total,
       SUM(pgs.pts)                        AS ppg_total,
       SUM(pgs.stl)                        AS spg_total,
       SUM(pgs.tov)                        AS tpg_total,
       SUM(pgs.trb)                        AS rpg_total,
       SUM(pgs.two_p)                      AS two_p_total,
       SUM(pgs.two_pa)                     AS two_pa_total,
       SUM(pgs.three_p)                    AS three_p_total,
       SUM(pgs.three_pa)                   AS three_pa_total,
       SUM(pgs.pts) / (
         2 :: NUMERIC * ( SUM(pgs.fga) + 0.44 * SUM(pgs.fta) )
       )                                   AS ts_pct,
       CASE
           WHEN AVG(pgs.fga) > 0::NUMERIC THEN AVG(pgs.fg) / AVG(pgs.fga)
           ELSE NULL::NUMERIC
           END                             AS fg_pct,
       CASE
           WHEN AVG(pgs.fta) > 0::NUMERIC THEN AVG(pgs.ft) / AVG(pgs.fta)
           ELSE NULL::NUMERIC
           END                             AS ft_pct,
       CASE
           WHEN AVG(pgs.two_pa) > 0::NUMERIC THEN AVG(pgs.two_p) / AVG(pgs.two_pa)
           ELSE NULL::NUMERIC
           END                             AS two_p_pct,
       CASE
           WHEN AVG(pgs.three_pa) > 0::NUMERIC THEN AVG(pgs.three_p) / AVG(pgs.three_pa)
           ELSE NULL::NUMERIC
           END                             AS three_p_pct
FROM simulator_playergamestats pgs
         JOIN simulator_simulation s ON pgs.simulation_id = s.uuid
         JOIN game_game g ON s.id = g.simulation_id
         JOIN simulator_player p ON pgs.player_id = p.uuid
WHERE g.visibility::TEXT = 'PUBLIC'::TEXT
  AND s.created_at >= '2023-08-21 17:00:00+00'::timestamp with time zone
GROUP BY pgs.player_id;

-- Needed because we are applying the 'CONCURRENTLY' param
-- when refreshing the materialized view
CREATE UNIQUE INDEX ON view_current_season_player_stats (player_id);