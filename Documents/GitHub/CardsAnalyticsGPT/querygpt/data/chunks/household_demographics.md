# Table: `household_demographics`

**Type:** dimension  
**Row count:** 7,200  
**Full path:** `samples.tpcds_sf1.household_demographics`

**Description:** Household-level demographics: income band, vehicle count, buy potential.

**Primary key(s):** `hd_demo_sk`

**Foreign keys:**
- `hd_income_band_sk` → `income_band.ib_income_band_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `hd_demo_sk` | `int` | 0.0 | 7,200 | Surrogate key |
| `hd_income_band_sk` | `int` | 0.0 | 20 | FK → income_band |
| `hd_buy_potential` | `string` | 0.0 | 6 | 0-500/501-1000/1001-5000/5001-10000/10001-20000/Unknown |
| `hd_dep_count` | `int` | 0.0 | 10 | Dependents in household |
| `hd_vehicle_count` | `int` | 0.0 | 6 | Vehicles owned |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.income_band ON household_demographics.hd_income_band_sk = income_band.ib_income_band_sk
```

## Sample values

- `hd_income_band_sk`: 2, 3, 4, 5, 6, 7
- `hd_buy_potential`: 0-500, 501-1000, 1001-5000, 5001-10000, >10000, Unknown
- `hd_dep_count`: 0, 1, 2, 3, 4, 5
- `hd_vehicle_count`: 0, 1, 2, 3, 4, -1