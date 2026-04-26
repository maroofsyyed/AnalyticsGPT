# Table: `date_dim`

**Type:** dimension  
**Row count:** 73,049  
**Full path:** `samples.tpcds_sf1.date_dim`

**Description:** Calendar dimension — every date 1900-2100 with fiscal and holiday flags.

**Primary key(s):** `d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `d_date_sk` | `int` | 0.0 | 73,049 | Surrogate key used in all fact table date FKs |
| `d_date_id` | `string` | 0.0 | 73,049 |  |
| `d_date` | `date` | 0.0 | 73,049 | Actual calendar date YYYY-MM-DD |
| `d_month_seq` | `int` | 0.0 | 2,401 |  |
| `d_week_seq` | `int` | 0.0 | 10,436 |  |
| `d_quarter_seq` | `int` | 0.0 | 801 |  |
| `d_year` | `int` | 0.0 | 201 | Calendar year |
| `d_dow` | `int` | 0.0 | 7 | Day of week 0=Sunday |
| `d_moy` | `int` | 0.0 | 12 | Month of year 1-12 |
| `d_dom` | `int` | 0.0 | 31 | Day of month |
| `d_qoy` | `int` | 0.0 | 4 | Quarter of year 1-4 |
| `d_fy_year` | `int` | 0.0 | 201 | Fiscal year |
| `d_fy_quarter_seq` | `int` | 0.0 | 801 | Fiscal quarter sequence |
| `d_fy_week_seq` | `int` | 0.0 | 10,436 | Fiscal week sequence |
| `d_day_name` | `string` | 0.0 | 7 |  |
| `d_quarter_name` | `string` | 0.0 | 801 |  |
| `d_holiday` | `string` | 0.0 | 2 | Y if public holiday |
| `d_weekend` | `string` | 0.0 | 2 | Y if Saturday or Sunday |
| `d_following_holiday` | `string` | 0.0 | 2 | Y if day before a holiday |
| `d_first_dom` | `int` | 0.0 | 2,401 |  |
| `d_last_dom` | `int` | 0.0 | 2,401 |  |
| `d_same_day_ly` | `int` | 0.0 | 73,000 | Same day last year (sk) — used for YoY comparisons |
| `d_same_day_lq` | `int` | 0.0 | 72,698 | Same day last quarter (sk) |
| `d_current_day` | `string` | 0.0 | 1 |  |
| `d_current_week` | `string` | 0.0 | 1 |  |
| `d_current_month` | `string` | 0.0 | 2 |  |
| `d_current_quarter` | `string` | 0.0 | 2 |  |
| `d_current_year` | `string` | 0.0 | 2 |  |

## Sample values

- `d_date_id`: AAAAAAAAOKJNECAA, AAAAAAAAPKJNECAA, AAAAAAAAALJNECAA, AAAAAAAABLJNECAA, AAAAAAAACLJNECAA, AAAAAAAADLJNECAA
- `d_dow`: 1, 2, 3, 4, 5, 6
- `d_moy`: 1, 2, 3, 4, 5, 6
- `d_dom`: 2, 3, 4, 5, 6, 7
- `d_qoy`: 1, 2, 3, 4