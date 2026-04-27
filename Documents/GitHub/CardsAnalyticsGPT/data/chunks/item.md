# Table: `item`

**Type:** dimension  
**Row count:** 18,000  
**Full path:** `samples.tpcds_sf1.item`

**Description:** Product catalog — all items ever sold across all channels.

**Primary key(s):** `i_item_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `i_item_sk` | `int` | 0.0 | 18,000 |  |
| `i_item_id` | `string` | 0.0 | 9,000 | Natural business key |
| `i_rec_start_date` | `date` | 0.3 | 5 |  |
| `i_rec_end_date` | `date` | 50.0 | 4 |  |
| `i_item_desc` | `string` | 0.27 | 13,436 | Long text description |
| `i_current_price` | `decimal(7,2)` | 0.27 | 2,583 | Current selling price |
| `i_wholesale_cost` | `decimal(7,2)` | 0.29 | 1,967 | Current cost to the business |
| `i_brand_id` | `int` | 0.32 | 952 | Brand identifier |
| `i_brand` | `string` | 0.35 | 713 | Brand name |
| `i_class_id` | `int` | 0.32 | 17 | Product class id |
| `i_class` | `string` | 0.29 | 100 | Product class e.g. electronics furniture |
| `i_category_id` | `int` | 0.25 | 11 | Category id |
| `i_category` | `string` | 0.29 | 11 | High-level category |
| `i_manufact_id` | `int` | 0.29 | 993 | Manufacturer id |
| `i_manufact` | `string` | 0.26 | 989 | Manufacturer name |
| `i_size` | `string` | 0.31 | 8 | Size descriptor |
| `i_formulation` | `string` | 0.26 | 13,444 |  |
| `i_color` | `string` | 0.25 | 93 | Color |
| `i_units` | `string` | 0.28 | 22 | Unit of measure |
| `i_container` | `string` | 0.28 | 2 | Packaging type |
| `i_manager_id` | `int` | 0.3 | 101 | Product manager id |
| `i_product_name` | `string` | 0.29 | 17,949 | Short product name |

## Sample values

- `i_item_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAHAAAAAAA, AAAAAAAAIAAAAAAA, AAAAAAAAKAAAAAAA
- `i_rec_start_date`: 1997-10-27, 2000-10-27, 1999-10-28, 2001-10-27
- `i_rec_end_date`: 2000-10-26, 1999-10-27, 2001-10-26
- `i_item_desc`: Agricultural sites will not provide skills. Again, New, strong , Absolute, Miles show only. Areas could stop british, local approaches. Ready , Sections would not want in a blocks. Elaborate days would not trip ancient mountains. Normal rules cannot happen long , Tomorrow different years mean highly in a circumstances. Financial fi
- `i_brand`: exportibrand #2, importounivamalg #3, importoedu pack #2, exportiimporto #1, namelesscorp #6, edu packedu pack #1