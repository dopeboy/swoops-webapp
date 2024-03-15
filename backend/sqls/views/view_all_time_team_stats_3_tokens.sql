CREATE MATERIALIZED VIEW IF NOT EXISTS view_all_time_team_stats_3_tokens AS
SELECT t.id                                AS team_id,
       COUNT(*)                            AS count,
       COUNT(*) FILTER (WHERE tgs.won)     AS wins,
       COUNT(*) FILTER (WHERE NOT tgs.won) AS losses,
       AVG(tgs.fg)                         AS fg,
       AVG(tgs.ft)                         AS ft,
       AVG(tgs.pf)                         AS fpg,
       AVG(tgs.ast)                        AS apg,
       AVG(tgs.blk)                        AS bpg,
       AVG(tgs.drb)                        AS drpg,
       AVG(tgs.fga)                        AS fga,
       AVG(tgs.fta)                        AS fta,
       AVG(tgs.orb)                        AS orpg,
       AVG(tgs.pts)                        AS ppg,
       AVG(tgs.stl)                        AS spg,
       AVG(tgs.tov)                        AS tpg,
       AVG(tgs.trb)                        AS rpg,
       AVG(tgs.two_p)                      AS two_p,
       AVG(tgs.two_pa)                     AS two_pa,
       AVG(tgs.three_p)                    AS three_p,
       AVG(tgs.three_pa)                   AS three_pa,
       SUM(tgs.fg)                         AS fg_total,
       SUM(tgs.ft)                         AS ft_total,
       SUM(tgs.pf)                         AS fpg_total,
       SUM(tgs.ast)                        AS apg_total,
       SUM(tgs.blk)                        AS bpg_total,
       SUM(tgs.drb)                        AS drpg_total,
       SUM(tgs.fga)                        AS fga_total,
       SUM(tgs.fta)                        AS fta_total,
       SUM(tgs.orb)                        AS orpg_total,
       SUM(tgs.pts)                        AS ppg_total,
       SUM(tgs.stl)                        AS spg_total,
       SUM(tgs.tov)                        AS tpg_total,
       SUM(tgs.trb)                        AS rpg_total,
       SUM(tgs.two_p)                      AS two_p_total,
       SUM(tgs.two_pa)                     AS two_pa_total,
       SUM(tgs.three_p)                    AS three_p_total,
       SUM(tgs.three_pa)                   AS three_pa_total,
       SUM(tgs.pts) / (
         2 :: NUMERIC * ( SUM(tgs.fga) + 0.44 * SUM(tgs.fta) )
       )                                   AS ts_pct,
       CASE
           WHEN AVG(tgs.fga) > 0::NUMERIC THEN AVG(tgs.fg) / AVG(tgs.fga)
           ELSE NULL::NUMERIC
           END                             AS fg_pct,
       CASE
           WHEN AVG(tgs.fta) > 0::NUMERIC THEN AVG(tgs.ft) / AVG(tgs.fta)
           ELSE NULL::NUMERIC
           END                             AS ft_pct,
       CASE
           WHEN AVG(tgs.two_pa) > 0::NUMERIC THEN AVG(tgs.two_p) / AVG(tgs.two_pa)
           ELSE NULL::NUMERIC
           END                             AS two_p_pct,
       CASE
           WHEN AVG(tgs.three_pa) > 0::NUMERIC THEN AVG(tgs.three_p) / AVG(tgs.three_pa)
           ELSE NULL::NUMERIC
           END                             AS three_p_pct
FROM simulator_teamgamestats tgs
         JOIN simulator_simulation s ON tgs.simulation_id = s.uuid
         JOIN game_game g ON s.id = g.simulation_id
         JOIN game_contest gc on gc.id = g.contest_id
         JOIN game_team t ON t.id = tgs.team_id
WHERE g.visibility::TEXT = 'PUBLIC'::TEXT
         AND gc.tokens_required = 3
GROUP BY t.id, t.name;
