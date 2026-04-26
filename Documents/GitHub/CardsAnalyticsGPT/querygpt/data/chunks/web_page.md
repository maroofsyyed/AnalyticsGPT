# Table: `web_page`

**Type:** dimension  
**Row count:** 60  
**Full path:** `samples.tpcds_sf1.web_page`

**Description:** Individual product/category pages on the website.

**Primary key(s):** `wp_web_page_sk`

**Foreign keys:**
- `wp_creation_date_sk` → `date_dim.d_date_sk`
- `wp_access_date_sk` → `date_dim.d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `wp_web_page_sk` | `int` | 0.0 | 60 |  |
| `wp_web_page_id` | `string` | 0.0 | 30 | Natural key |
| `wp_rec_start_date` | `date` | 0.0 | 4 |  |
| `wp_rec_end_date` | `date` | 50.0 | 4 |  |
| `wp_creation_date_sk` | `int` | 0.0 | 9 | When page was created → date_dim |
| `wp_access_date_sk` | `int` | 0.0 | 36 |  |
| `wp_autogen_flag` | `string` | 0.0 | 2 |  |
| `wp_customer_sk` | `int` | 71.67 | 16 |  |
| `wp_url` | `string` | 0.0 | 1 | Full URL |
| `wp_type` | `string` | 0.0 | 7 | welcome/dynamic/order/feedback etc |
| `wp_char_count` | `int` | 0.0 | 49 | Character count of page content |
| `wp_link_count` | `int` | 0.0 | 20 | Links on page |
| `wp_image_count` | `int` | 0.0 | 7 | Images on page |
| `wp_max_ad_count` | `int` | 0.0 | 5 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON web_page.wp_creation_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON web_page.wp_access_date_sk = date_dim.d_date_sk
```

## Sample values

- `wp_web_page_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAHAAAAAAA, AAAAAAAAIAAAAAAA, AAAAAAAAKAAAAAAA
- `wp_rec_start_date`: 1997-09-03, 2000-09-03, 1999-09-04, 2001-09-03
- `wp_rec_end_date`: 2000-09-02, 1999-09-03, 2001-09-02
- `wp_creation_date_sk`: 2450808, 2450809, 2450812, 2450815, 2450810, 2450814
- `wp_access_date_sk`: 2452553, 2452620, 2452612, 2452618, 2452599, 2452555