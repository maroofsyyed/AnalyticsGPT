# Table: `call_center`

**Type:** dimension  
**Row count:** 6  
**Full path:** `samples.tpcds_sf1.call_center`

**Description:** Call centers handling catalog channel orders.

**Primary key(s):** `cc_call_center_sk`

**Foreign keys:**
- `cc_closed_date_sk` → `date_dim.d_date_sk`
- `cc_open_date_sk` → `date_dim.d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `cc_call_center_sk` | `int` | 0.0 | 6 |  |
| `cc_call_center_id` | `string` | 0.0 | 3 | Natural key |
| `cc_rec_start_date` | `date` | 0.0 | 4 |  |
| `cc_rec_end_date` | `date` | 50.0 | 4 |  |
| `cc_closed_date_sk` | `int` | 100.0 | 1 |  |
| `cc_open_date_sk` | `int` | 0.0 | 3 |  |
| `cc_name` | `string` | 0.0 | 3 | Center name |
| `cc_class` | `string` | 0.0 | 3 |  |
| `cc_employees` | `int` | 0.0 | 3 | Number of employees |
| `cc_sq_ft` | `int` | 0.0 | 3 |  |
| `cc_hours` | `string` | 0.0 | 2 | Operating hours |
| `cc_manager` | `string` | 0.0 | 5 | Manager name |
| `cc_mkt_id` | `int` | 0.0 | 3 |  |
| `cc_mkt_class` | `string` | 0.0 | 4 | Market classification |
| `cc_mkt_desc` | `string` | 0.0 | 6 |  |
| `cc_market_manager` | `string` | 0.0 | 6 |  |
| `cc_division` | `int` | 0.0 | 4 |  |
| `cc_division_name` | `string` | 0.0 | 4 |  |
| `cc_company` | `int` | 0.0 | 4 |  |
| `cc_company_name` | `string` | 0.0 | 3 |  |
| `cc_street_number` | `string` | 0.0 | 3 |  |
| `cc_street_name` | `string` | 0.0 | 3 |  |
| `cc_street_type` | `string` | 0.0 | 3 |  |
| `cc_suite_number` | `string` | 0.0 | 3 |  |
| `cc_city` | `string` | 0.0 | 1 |  |
| `cc_county` | `string` | 0.0 | 1 |  |
| `cc_state` | `string` | 0.0 | 1 |  |
| `cc_zip` | `string` | 0.0 | 1 |  |
| `cc_country` | `string` | 0.0 | 1 |  |
| `cc_gmt_offset` | `decimal(5,2)` | 0.0 | 1 |  |
| `cc_tax_percentage` | `decimal(5,2)` | 0.0 | 4 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON call_center.cc_closed_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON call_center.cc_open_date_sk = date_dim.d_date_sk
```

## Sample values

- `cc_call_center_sk`: 1, 2, 3, 4, 5, 6
- `cc_call_center_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAAEAAAAAAA
- `cc_rec_start_date`: 1998-01-01, 2001-01-01, 2000-01-02, 2002-01-01
- `cc_rec_end_date`: 2000-12-31, 2000-01-01, 2001-12-31
- `cc_open_date_sk`: 2450997, 2450876, 2450872