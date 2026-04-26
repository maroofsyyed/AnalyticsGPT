# Table: `time_dim`

**Type:** dimension  
**Row count:** 86,400  
**Full path:** `samples.tpcds_sf1.time_dim`

**Description:** Time-of-day dimension in seconds. 86400 rows = every second in a day.

**Primary key(s):** `t_time_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `t_time_sk` | `int` | 0.0 | 86,400 | Surrogate key |
| `t_time_id` | `string` | 0.0 | 86,400 |  |
| `t_time` | `int` | 0.0 | 86,400 | Seconds since midnight |
| `t_hour` | `int` | 0.0 | 24 | Hour 0-23 |
| `t_minute` | `int` | 0.0 | 60 | Minute 0-59 |
| `t_second` | `int` | 0.0 | 60 | Second 0-59 |
| `t_am_pm` | `string` | 0.0 | 2 | AM or PM |
| `t_shift` | `string` | 0.0 | 3 | Work shift: Morning/Evening/Night |
| `t_sub_shift` | `string` | 0.0 | 4 | Sub-shift: Early/Mid/Late |
| `t_meal_time` | `string` | 58.33 | 4 | Breakfast/Lunch/Dinner (nullable) |

## Sample values

- `t_time_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `t_hour`: 0, 1, 2, 3, 4, 5
- `t_am_pm`: AM, PM
- `t_shift`: third, first, second
- `t_sub_shift`: night, morning, afternoon, evening