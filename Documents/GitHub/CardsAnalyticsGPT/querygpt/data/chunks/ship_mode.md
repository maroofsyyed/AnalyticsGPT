# Table: `ship_mode`

**Type:** dimension  
**Row count:** 20  
**Full path:** `samples.tpcds_sf1.ship_mode`

**Description:** Shipping methods: Express/Standard/Two-Day/Overnight etc.

**Primary key(s):** `sm_ship_mode_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `sm_ship_mode_sk` | `int` | 0.0 | 20 | Surrogate key |
| `sm_ship_mode_id` | `string` | 0.0 | 20 |  |
| `sm_type` | `string` | 0.0 | 6 | Express/Standard/Two-Day/Library/Overnight/Next Day Air |
| `sm_code` | `string` | 0.0 | 4 |  |
| `sm_carrier` | `string` | 0.0 | 20 | Carrier name e.g. DHL UPS |
| `sm_contract` | `string` | 0.0 | 20 | Contract reference |

## Sample values

- `sm_ship_mode_sk`: 1, 2, 3, 4, 5, 6
- `sm_ship_mode_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `sm_type`: EXPRESS, NEXT DAY, OVERNIGHT, TWO DAY, LIBRARY, REGULAR
- `sm_code`: AIR, SURFACE, SEA, BIKE
- `sm_carrier`: UPS, FEDEX, AIRBORNE, USPS, DHL, TBS