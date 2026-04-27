# Table: `catalog_returns`

**Type:** fact  
**Row count:** 143,672  
**Full path:** `samples.tpcds_sf1.catalog_returns`

**Description:** Returns from catalog orders.

**Primary key(s):** `cr_item_sk`, `cr_order_number`

**Foreign keys:**
- `cr_returned_date_sk` → `date_dim.d_date_sk`
- `cr_return_time_sk` → `time_dim.t_time_sk`
- `cr_item_sk` → `item.i_item_sk`
- `cr_refunded_customer_sk` → `customer.c_customer_sk`
- `cr_refunded_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `cr_refunded_hdemo_sk` → `household_demographics.hd_demo_sk`
- `cr_refunded_addr_sk` → `customer_address.ca_address_sk`
- `cr_call_center_sk` → `call_center.cc_call_center_sk`
- `cr_catalog_page_sk` → `catalog_page.cp_catalog_page_sk`
- `cr_ship_mode_sk` → `ship_mode.sm_ship_mode_sk`
- `cr_warehouse_sk` → `warehouse.w_warehouse_sk`
- `cr_reason_sk` → `reason.r_reason_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `cr_returned_date_sk` | `int` | 0.0 | 2,066 |  |
| `cr_returned_time_sk` | `int` | 0.0 | 64,772 |  |
| `cr_item_sk` | `int` | 0.0 | 17,871 |  |
| `cr_refunded_customer_sk` | `int` | 1.97 | 60,719 | Customer getting refund |
| `cr_refunded_cdemo_sk` | `int` | 2.03 | 90,778 |  |
| `cr_refunded_hdemo_sk` | `int` | 1.99 | 7,201 |  |
| `cr_refunded_addr_sk` | `int` | 2.01 | 42,191 |  |
| `cr_returning_customer_sk` | `int` | 1.98 | 75,541 |  |
| `cr_returning_cdemo_sk` | `int` | 2.01 | 135,239 |  |
| `cr_returning_hdemo_sk` | `int` | 2.0 | 7,201 |  |
| `cr_returning_addr_sk` | `int` | 2.0 | 46,889 |  |
| `cr_call_center_sk` | `int` | 2.04 | 7 | Call center handling return |
| `cr_catalog_page_sk` | `int` | 1.99 | 6,540 |  |
| `cr_ship_mode_sk` | `int` | 1.94 | 21 |  |
| `cr_warehouse_sk` | `int` | 2.04 | 6 |  |
| `cr_reason_sk` | `int` | 1.99 | 36 | Return reason → reason |
| `cr_order_number` | `bigint` | 0.0 | 94,207 |  |
| `cr_return_quantity` | `int` | 1.98 | 101 |  |
| `cr_return_amount` | `decimal(7,2)` | 2.02 | 82,075 | Refund amount |
| `cr_return_tax` | `decimal(7,2)` | 2.0 | 25,946 |  |
| `cr_return_amt_inc_tax` | `decimal(7,2)` | 2.01 | 96,226 |  |
| `cr_fee` | `decimal(7,2)` | 1.97 | 9,952 |  |
| `cr_return_ship_cost` | `decimal(7,2)` | 1.98 | 64,359 |  |
| `cr_refunded_cash` | `decimal(7,2)` | 2.01 | 73,576 |  |
| `cr_reversed_charge` | `decimal(7,2)` | 1.99 | 54,940 |  |
| `cr_store_credit` | `decimal(7,2)` | 2.02 | 54,301 |  |
| `cr_net_loss` | `decimal(7,2)` | 1.96 | 86,775 |  |
| `cr_returned_date_sk` | `int` | 0.0 | 2,066 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON catalog_returns.cr_returned_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.time_dim ON catalog_returns.cr_return_time_sk = time_dim.t_time_sk
```
```sql
JOIN samples.tpcds_sf1.item ON catalog_returns.cr_item_sk = item.i_item_sk
```
```sql
JOIN samples.tpcds_sf1.customer ON catalog_returns.cr_refunded_customer_sk = customer.c_customer_sk
```

## Sample values

- `cr_call_center_sk`: 6, 3, 2, 4, 5, 1
- `cr_ship_mode_sk`: 14, 18, 6, 3, 7, 15
- `cr_warehouse_sk`: 3, 2, 4, 5, 1
- `cr_reason_sk`: 14, 18, 31, 7, 3, 26