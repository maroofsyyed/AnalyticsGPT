# Table: `reason`

**Type:** dimension  
**Row count:** 35  
**Full path:** `samples.tpcds_sf1.reason`

**Description:** Return reason codes referenced by all three return fact tables.

**Primary key(s):** `r_reason_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `r_reason_sk` | `int` | 0.0 | 35 | Surrogate key |
| `r_reason_id` | `string` | 0.0 | 35 | Natural key |
| `r_reason_desc` | `string` | 0.0 | 34 | Plain text e.g. Did not fit / Defective product |

## Sample values

- `r_reason_sk`: 1, 2, 3, 4, 5, 6
- `r_reason_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `r_reason_desc`: Package was damaged, Stopped working, Did not get it on time, Not the product that was ordred, Parts missing, Does not work with a product that I have