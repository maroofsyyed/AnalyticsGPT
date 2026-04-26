# Table: `catalog_page`

**Type:** dimension  
**Row count:** 11,718  
**Full path:** `samples.tpcds_sf1.catalog_page`

**Description:** Individual pages in printed/digital catalogs tied to catalog_sales.

**Primary key(s):** `cp_catalog_page_sk`

**Foreign keys:**
- `cp_start_date_sk` → `date_dim.d_date_sk`
- `cp_end_date_sk` → `date_dim.d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `cp_catalog_page_sk` | `int` | 0.0 | 11,718 |  |
| `cp_catalog_page_id` | `string` | 0.0 | 11,718 | Natural key |
| `cp_start_date_sk` | `int` | 0.93 | 92 | Validity start → date_dim |
| `cp_end_date_sk` | `int` | 0.87 | 98 | Validity end → date_dim |
| `cp_department` | `string` | 0.89 | 2 | Department this page belongs to |
| `cp_catalog_number` | `int` | 0.84 | 110 | Which catalog issue |
| `cp_catalog_page_number` | `int` | 0.97 | 109 | Page number in catalog |
| `cp_description` | `string` | 0.87 | 11,617 |  |
| `cp_type` | `string` | 0.79 | 4 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON catalog_page.cp_start_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON catalog_page.cp_end_date_sk = date_dim.d_date_sk
```

## Sample values

- `cp_catalog_page_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `cp_department`: DEPARTMENT
- `cp_description`: Democratic jobs would not let small, different names. Voluntary, very condit, Now legal movements should exchange long as the bodies. Effects li, Political feet could make backwards to a affairs. Political tourists must become in, Workers devise however days; readers recover a little on a stand, Red, high periods ought to enter political words. Pr, Bright supporters used to lighten degrees. Always good l
- `cp_type`: bi-annual, quarterly, monthly