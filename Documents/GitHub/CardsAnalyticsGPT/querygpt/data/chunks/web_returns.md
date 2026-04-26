# Table: `web_returns`

**Type:** fact  
**Row count:** 71,772  
**Full path:** `samples.tpcds_sf1.web_returns`

**Description:** Returns from web orders.

**Primary key(s):** `wr_item_sk`, `wr_order_number`

**Foreign keys:**
- `wr_returned_date_sk` → `date_dim.d_date_sk`
- `wr_return_time_sk` → `time_dim.t_time_sk`
- `wr_item_sk` → `item.i_item_sk`
- `wr_refunded_customer_sk` → `customer.c_customer_sk`
- `wr_refunded_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `wr_refunded_hdemo_sk` → `household_demographics.hd_demo_sk`
- `wr_refunded_addr_sk` → `customer_address.ca_address_sk`
- `wr_web_page_sk` → `web_page.wp_web_page_sk`
- `wr_reason_sk` → `reason.r_reason_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `wr_returned_date_sk` | `int` | 4.47 | 2,110 |  |
| `wr_returned_time_sk` | `int` | 4.52 | 44,673 |  |
| `wr_item_sk` | `int` | 0.0 | 16,983 |  |
| `wr_refunded_customer_sk` | `int` | 4.41 | 49,502 | Customer getting refund |
| `wr_refunded_cdemo_sk` | `int` | 4.44 | 67,250 |  |
| `wr_refunded_hdemo_sk` | `int` | 4.52 | 7,201 |  |
| `wr_refunded_addr_sk` | `int` | 4.53 | 37,280 |  |
| `wr_returning_customer_sk` | `int` | 4.55 | 49,422 | Customer physically returning (may differ) |
| `wr_returning_cdemo_sk` | `int` | 4.47 | 67,236 |  |
| `wr_returning_hdemo_sk` | `int` | 4.42 | 7,201 |  |
| `wr_returning_addr_sk` | `int` | 4.43 | 37,341 |  |
| `wr_web_page_sk` | `int` | 4.46 | 61 |  |
| `wr_reason_sk` | `int` | 4.5 | 36 | Return reason → reason |
| `wr_order_number` | `bigint` | 0.0 | 42,359 |  |
| `wr_return_quantity` | `int` | 4.38 | 101 |  |
| `wr_return_amt` | `decimal(7,2)` | 4.51 | 48,935 | Refund amount |
| `wr_return_tax` | `decimal(7,2)` | 4.35 | 18,373 |  |
| `wr_return_amt_inc_tax` | `decimal(7,2)` | 4.44 | 54,993 |  |
| `wr_fee` | `decimal(7,2)` | 4.54 | 9,942 |  |
| `wr_return_ship_cost` | `decimal(7,2)` | 4.4 | 40,561 |  |
| `wr_refunded_cash` | `decimal(7,2)` | 4.42 | 44,362 |  |
| `wr_reversed_charge` | `decimal(7,2)` | 4.53 | 34,319 |  |
| `wr_account_credit` | `decimal(7,2)` | 4.49 | 34,031 |  |
| `wr_net_loss` | `decimal(7,2)` | 4.45 | 51,892 |  |
| `wr_returned_date_sk` | `int` | 4.47 | 2,110 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON web_returns.wr_returned_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.time_dim ON web_returns.wr_return_time_sk = time_dim.t_time_sk
```
```sql
JOIN samples.tpcds_sf1.item ON web_returns.wr_item_sk = item.i_item_sk
```
```sql
JOIN samples.tpcds_sf1.customer ON web_returns.wr_refunded_customer_sk = customer.c_customer_sk
```

## Sample values

- `wr_reason_sk`: 5, 18, 4, 22, 33, 34