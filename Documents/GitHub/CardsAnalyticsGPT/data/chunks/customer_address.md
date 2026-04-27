# Table: `customer_address`

**Type:** dimension  
**Row count:** 50,000  
**Full path:** `samples.tpcds_sf1.customer_address`

**Description:** Addresses used for billing and shipping across all channels.

**Primary key(s):** `ca_address_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `ca_address_sk` | `int` | 0.0 | 50,000 | Surrogate key |
| `ca_address_id` | `string` | 0.0 | 50,000 | Natural business key |
| `ca_street_number` | `string` | 3.07 | 1,001 |  |
| `ca_street_name` | `string` | 3.03 | 6,922 |  |
| `ca_street_type` | `string` | 3.03 | 21 |  |
| `ca_suite_number` | `string` | 3.1 | 76 |  |
| `ca_city` | `string` | 2.99 | 703 | City |
| `ca_county` | `string` | 3.0 | 1,847 | County |
| `ca_state` | `string` | 3.12 | 52 | State |
| `ca_zip` | `string` | 3.03 | 3,702 | ZIP code |
| `ca_country` | `string` | 3.07 | 2 | Country |
| `ca_gmt_offset` | `decimal(5,2)` | 3.09 | 7 | Timezone |
| `ca_location_type` | `string` | 3.01 | 4 | Condo/House/Unknown |

## Sample values

- `ca_address_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `ca_street_number`: 283, 420, 269, 204, 851, 91
- `ca_street_name`: Main Willow, 5th West, Center , 2nd Spruce, Sycamore , Sunset Green
- `ca_street_type`: Ln, Lane, Dr., Way, Parkway, Pkwy
- `ca_suite_number`: Suite Y, Suite 180, Suite D, Suite B, Suite 250, Suite P