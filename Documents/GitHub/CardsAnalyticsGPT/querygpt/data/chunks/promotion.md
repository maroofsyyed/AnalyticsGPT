# Table: `promotion`

**Type:** dimension  
**Row count:** 300  
**Full path:** `samples.tpcds_sf1.promotion`

**Description:** Promotions applied to sales — channel flags and discount details.

**Primary key(s):** `p_promo_sk`

**Foreign keys:**
- `p_start_date_sk` → `date_dim.d_date_sk`
- `p_end_date_sk` → `date_dim.d_date_sk`
- `p_item_sk` → `item.i_item_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `p_promo_sk` | `int` | 0.0 | 300 |  |
| `p_promo_id` | `string` | 0.0 | 300 | Natural business key |
| `p_start_date_sk` | `int` | 1.67 | 245 |  |
| `p_end_date_sk` | `int` | 0.67 | 257 |  |
| `p_item_sk` | `int` | 1.33 | 293 |  |
| `p_cost` | `decimal(15,2)` | 1.0 | 2 |  |
| `p_response_target` | `int` | 1.33 | 2 |  |
| `p_promo_name` | `string` | 1.33 | 11 | Promotion display name |
| `p_channel_dmail` | `string` | 0.0 | 2 | Y if direct mail |
| `p_channel_email` | `string` | 0.67 | 2 | Y if email |
| `p_channel_catalog` | `string` | 1.33 | 2 | Y if catalog |
| `p_channel_tv` | `string` | 1.0 | 2 | Y if TV |
| `p_channel_radio` | `string` | 1.33 | 2 | Y if radio |
| `p_channel_press` | `string` | 0.67 | 2 | Y if print/press |
| `p_channel_event` | `string` | 1.33 | 2 | Y if in-person event |
| `p_channel_demo` | `string` | 0.67 | 2 |  |
| `p_channel_details` | `string` | 0.33 | 300 |  |
| `p_purpose` | `string` | 2.0 | 2 | Unknown/Cross-Sell/Upsell |
| `p_discount_active` | `string` | 0.67 | 2 | Y if discount currently active |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON promotion.p_start_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON promotion.p_end_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.item ON promotion.p_item_sk = item.i_item_sk
```

## Sample values

- `p_promo_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `p_cost`: 1000.00
- `p_response_target`: 1
- `p_promo_name`: ought, able, pri, ese, anti, cally
- `p_channel_dmail`: N, Y