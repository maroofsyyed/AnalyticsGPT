# Table: `warehouse`

**Type:** dimension  
**Row count:** 5  
**Full path:** `samples.tpcds_sf1.warehouse`

**Description:** Fulfilment warehouses used in web and catalog sales.

**Primary key(s):** `w_warehouse_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `w_warehouse_sk` | `int` | 0.0 | 5 |  |
| `w_warehouse_id` | `string` | 0.0 | 5 | Natural business key |
| `w_warehouse_name` | `string` | 0.0 | 5 | Warehouse name |
| `w_warehouse_sq_ft` | `int` | 0.0 | 5 | Floor size sq ft |
| `w_street_number` | `string` | 0.0 | 5 |  |
| `w_street_name` | `string` | 0.0 | 5 |  |
| `w_street_type` | `string` | 0.0 | 4 |  |
| `w_suite_number` | `string` | 0.0 | 5 |  |
| `w_city` | `string` | 0.0 | 2 | City |
| `w_county` | `string` | 0.0 | 1 |  |
| `w_state` | `string` | 0.0 | 1 | State |
| `w_zip` | `string` | 0.0 | 2 | ZIP |
| `w_country` | `string` | 0.0 | 1 | Country |
| `w_gmt_offset` | `decimal(5,2)` | 0.0 | 1 | Timezone offset |

## Sample values

- `w_warehouse_sk`: 1, 2, 3, 4, 5
- `w_warehouse_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA
- `w_warehouse_name`: Significantly, Just good amou, Selective,, Operations, Matches produce
- `w_warehouse_sq_ft`: 200313, 933435, 720621, 500020, 198821
- `w_street_number`: 563, 11, 218, 461, 808