# Table: `store_returns`

**Type:** fact  
**Row count:** 288,279  
**Full path:** `samples.tpcds_sf1.store_returns`

**Description:** Items returned to physical stores. Links to store_sales via item_sk + ticket_number.

**Primary key(s):** `sr_item_sk`, `sr_ticket_number`

**Foreign keys:**
- `sr_returned_date_sk` → `date_dim.d_date_sk`
- `sr_return_time_sk` → `time_dim.t_time_sk`
- `sr_item_sk` → `item.i_item_sk`
- `sr_customer_sk` → `customer.c_customer_sk`
- `sr_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `sr_hdemo_sk` → `household_demographics.hd_demo_sk`
- `sr_addr_sk` → `customer_address.ca_address_sk`
- `sr_store_sk` → `store.s_store_sk`
- `sr_reason_sk` → `reason.r_reason_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `sr_returned_date_sk` | `int` | 3.5 | 2,002 | Return date → date_dim |
| `sr_return_time_sk` | `int` | 3.45 | 32,397 |  |
| `sr_item_sk` | `int` | 0.0 | 17,993 | Returned item → item |
| `sr_customer_sk` | `int` | 3.48 | 87,026 |  |
| `sr_cdemo_sk` | `int` | 3.48 | 259,000 |  |
| `sr_hdemo_sk` | `int` | 3.5 | 7,201 |  |
| `sr_addr_sk` | `int` | 3.47 | 49,807 |  |
| `sr_store_sk` | `int` | 3.42 | 7 |  |
| `sr_reason_sk` | `int` | 3.53 | 36 | Return reason → reason |
| `sr_ticket_number` | `bigint` | 0.0 | 169,998 | Original ticket number (join to store_sales) |
| `sr_return_quantity` | `int` | 3.47 | 101 |  |
| `sr_return_amt` | `decimal(7,2)` | 3.48 | 113,971 | Refund amount |
| `sr_return_tax` | `decimal(7,2)` | 3.49 | 29,131 | Tax refunded |
| `sr_return_amt_inc_tax` | `decimal(7,2)` | 3.49 | 141,855 |  |
| `sr_fee` | `decimal(7,2)` | 3.51 | 9,952 |  |
| `sr_return_ship_cost` | `decimal(7,2)` | 3.47 | 82,177 |  |
| `sr_refunded_cash` | `decimal(7,2)` | 3.48 | 102,115 |  |
| `sr_reversed_charge` | `decimal(7,2)` | 3.47 | 73,314 |  |
| `sr_store_credit` | `decimal(7,2)` | 3.49 | 72,304 |  |
| `sr_net_loss` | `decimal(7,2)` | 3.47 | 118,654 | Net loss from return |
| `sr_returned_date_sk` | `int` | 3.5 | 2,002 | Return date → date_dim |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON store_returns.sr_returned_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.time_dim ON store_returns.sr_return_time_sk = time_dim.t_time_sk
```
```sql
JOIN samples.tpcds_sf1.item ON store_returns.sr_item_sk = item.i_item_sk
```
```sql
JOIN samples.tpcds_sf1.customer ON store_returns.sr_customer_sk = customer.c_customer_sk
```

## Sample values

- `sr_store_sk`: 1, 2, 7, 8, 10, 4
- `sr_reason_sk`: 34, 13, 9, 33, 31, 1