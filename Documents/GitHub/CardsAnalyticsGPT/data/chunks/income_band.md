# Table: `income_band`

**Type:** dimension  
**Row count:** 20  
**Full path:** `samples.tpcds_sf1.income_band`

**Description:** Income brackets referenced by household_demographics.

**Primary key(s):** `ib_income_band_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `ib_income_band_sk` | `int` | 0.0 | 20 | Surrogate key |
| `ib_lower_bound` | `int` | 0.0 | 20 | Lower income bound $ |
| `ib_upper_bound` | `int` | 0.0 | 20 | Upper income bound $ |

## Sample values

- `ib_income_band_sk`: 1, 2, 3, 4, 5, 6
- `ib_lower_bound`: 0, 10001, 20001, 30001, 40001, 50001
- `ib_upper_bound`: 10000, 20000, 30000, 40000, 50000, 60000