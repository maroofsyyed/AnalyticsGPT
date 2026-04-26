# Table: `store`

**Type:** dimension  
**Row count:** 12  
**Full path:** `samples.tpcds_sf1.store`

**Description:** Physical store locations with size, geography, staffing.

**Primary key(s):** `s_store_sk`

**Foreign keys:**
- `s_closed_date_sk` → `date_dim.d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `s_store_sk` | `int` | 0.0 | 12 |  |
| `s_store_id` | `string` | 0.0 | 6 | Natural business key |
| `s_rec_start_date` | `date` | 0.0 | 4 |  |
| `s_rec_end_date` | `date` | 50.0 | 4 |  |
| `s_closed_date_sk` | `int` | 91.67 | 2 |  |
| `s_store_name` | `string` | 0.0 | 7 | Store brand name |
| `s_number_employees` | `int` | 0.0 | 7 | Staff headcount |
| `s_floor_space` | `int` | 0.0 | 8 | Floor area sq ft |
| `s_hours` | `string` | 0.0 | 3 | Operating hours |
| `s_manager` | `string` | 0.0 | 9 | Store manager name |
| `s_market_id` | `int` | 0.0 | 5 | Market territory id |
| `s_geography_class` | `string` | 0.0 | 1 | Urban/Suburban/Rural |
| `s_market_desc` | `string` | 0.0 | 12 |  |
| `s_market_manager` | `string` | 0.0 | 7 |  |
| `s_division_id` | `int` | 0.0 | 1 |  |
| `s_division_name` | `string` | 0.0 | 1 |  |
| `s_company_id` | `int` | 0.0 | 1 |  |
| `s_company_name` | `string` | 0.0 | 1 |  |
| `s_street_number` | `string` | 0.0 | 8 |  |
| `s_street_name` | `string` | 0.0 | 11 |  |
| `s_street_type` | `string` | 0.0 | 10 |  |
| `s_suite_number` | `string` | 0.0 | 9 |  |
| `s_city` | `string` | 0.0 | 2 | City |
| `s_county` | `string` | 0.0 | 1 |  |
| `s_state` | `string` | 0.0 | 1 | US state abbreviation |
| `s_zip` | `string` | 0.0 | 2 | ZIP code |
| `s_country` | `string` | 0.0 | 1 |  |
| `s_gmt_offset` | `decimal(5,2)` | 0.0 | 1 | Timezone offset from GMT |
| `s_tax_precentage` | `decimal(5,2)` | 0.0 | 5 | Local tax rate (misspelled in source) |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON store.s_closed_date_sk = date_dim.d_date_sk
```

## Sample values

- `s_store_sk`: 1, 2, 3, 4, 5, 6
- `s_store_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAHAAAAAAA, AAAAAAAAIAAAAAAA, AAAAAAAAKAAAAAAA
- `s_rec_start_date`: 1997-03-13, 2000-03-13, 1999-03-14, 2001-03-13
- `s_rec_end_date`: 2000-03-12, 1999-03-13, 2001-03-12
- `s_closed_date_sk`: 2451065