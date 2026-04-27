# Table: `web_site`

**Type:** dimension  
**Row count:** 30  
**Full path:** `samples.tpcds_sf1.web_site`

**Description:** Website entities that run web sales channels.

**Primary key(s):** `web_site_sk`

**Foreign keys:**
- `web_open_date_sk` → `date_dim.d_date_sk`
- `web_close_date_sk` → `date_dim.d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `web_site_sk` | `int` | 0.0 | 30 |  |
| `web_site_id` | `string` | 0.0 | 15 | Natural key |
| `web_rec_start_date` | `date` | 0.0 | 4 |  |
| `web_rec_end_date` | `date` | 50.0 | 4 |  |
| `web_name` | `string` | 0.0 | 5 | Website name |
| `web_open_date_sk` | `int` | 0.0 | 15 | Launch date → date_dim |
| `web_close_date_sk` | `int` | 16.67 | 11 |  |
| `web_class` | `string` | 0.0 | 1 | Website tier |
| `web_manager` | `string` | 0.0 | 20 | Manager name |
| `web_mkt_id` | `int` | 0.0 | 6 |  |
| `web_mkt_class` | `string` | 0.0 | 25 |  |
| `web_mkt_desc` | `string` | 0.0 | 24 |  |
| `web_market_manager` | `string` | 0.0 | 20 |  |
| `web_company_id` | `int` | 0.0 | 6 |  |
| `web_company_name` | `string` | 0.0 | 6 | Legal company name |
| `web_street_number` | `string` | 0.0 | 25 |  |
| `web_street_name` | `string` | 0.0 | 30 |  |
| `web_street_type` | `string` | 0.0 | 14 |  |
| `web_suite_number` | `string` | 0.0 | 23 |  |
| `web_city` | `string` | 0.0 | 2 |  |
| `web_county` | `string` | 0.0 | 1 |  |
| `web_state` | `string` | 0.0 | 1 |  |
| `web_zip` | `string` | 0.0 | 2 |  |
| `web_country` | `string` | 0.0 | 1 |  |
| `web_gmt_offset` | `decimal(5,2)` | 0.0 | 1 |  |
| `web_tax_percentage` | `decimal(5,2)` | 0.0 | 9 | Tax rate for this site region |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON web_site.web_open_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON web_site.web_close_date_sk = date_dim.d_date_sk
```

## Sample values

- `web_site_sk`: 1, 2, 3, 4, 5, 6
- `web_site_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAHAAAAAAA, AAAAAAAAIAAAAAAA, AAAAAAAAKAAAAAAA
- `web_rec_start_date`: 1997-08-16, 2000-08-16, 1999-08-17, 2001-08-16
- `web_rec_end_date`: 2000-08-15, 1999-08-16, 2001-08-15
- `web_name`: site_0, site_1, site_2, site_3, site_4