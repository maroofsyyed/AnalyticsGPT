# Table: `store_sales`

**Type:** fact  
**Row count:** 2,879,789  
**Full path:** `samples.tpcds_sf1.store_sales`

**Description:** Point-of-sale transactions at physical stores. One row per item per ticket.

**Primary key(s):** `ss_item_sk`, `ss_ticket_number`

**Foreign keys:**
- `ss_sold_date_sk` → `date_dim.d_date_sk`
- `ss_sold_time_sk` → `time_dim.t_time_sk`
- `ss_item_sk` → `item.i_item_sk`
- `ss_customer_sk` → `customer.c_customer_sk`
- `ss_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `ss_hdemo_sk` → `household_demographics.hd_demo_sk`
- `ss_addr_sk` → `customer_address.ca_address_sk`
- `ss_store_sk` → `store.s_store_sk`
- `ss_promo_sk` → `promotion.p_promo_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `ss_sold_date_sk` | `int` | 4.48 | 1,824 | Date of sale → date_dim |
| `ss_sold_time_sk` | `int` | 4.5 | 45,669 | Time of sale in seconds → time_dim |
| `ss_item_sk` | `int` | 0.0 | 18,000 | Item sold → item |
| `ss_customer_sk` | `int` | 4.51 | 90,899 | Buyer → customer (null if anonymous) |
| `ss_cdemo_sk` | `int` | 4.51 | 225,605 | Customer demographic profile → customer_demographics |
| `ss_hdemo_sk` | `int` | 4.49 | 7,201 | Household demographics → household_demographics |
| `ss_addr_sk` | `int` | 4.48 | 49,607 | Customer address at purchase time → customer_address |
| `ss_store_sk` | `int` | 4.48 | 7 | Store where sold → store |
| `ss_promo_sk` | `int` | 4.48 | 301 | Promotion applied (nullable) → promotion |
| `ss_ticket_number` | `bigint` | 0.0 | 240,000 | Receipt/basket ID — groups all items in one trip |
| `ss_quantity` | `int` | 4.5 | 101 | Units purchased |
| `ss_wholesale_cost` | `decimal(7,2)` | 4.5 | 9,902 | Cost to the store |
| `ss_list_price` | `decimal(7,2)` | 4.5 | 19,728 | Full retail price before discount |
| `ss_sales_price` | `decimal(7,2)` | 4.49 | 18,692 | Actual price paid after discount |
| `ss_ext_discount_amt` | `decimal(7,2)` | 4.5 | 209,754 | Total discount = (list-sales) × qty |
| `ss_ext_sales_price` | `decimal(7,2)` | 4.48 | 411,591 | Total revenue = sales_price × qty |
| `ss_ext_wholesale_cost` | `decimal(7,2)` | 4.49 | 380,901 | Total cost = wholesale_cost × qty |
| `ss_ext_list_price` | `decimal(7,2)` | 4.48 | 578,765 | Total list = list_price × qty |
| `ss_ext_tax` | `decimal(7,2)` | 4.48 | 78,619 | Tax on this line item |
| `ss_coupon_amt` | `decimal(7,2)` | 4.5 | 209,754 | Coupon discount applied |
| `ss_net_paid` | `decimal(7,2)` | 4.5 | 463,524 | Amount paid = ext_sales_price - coupon |
| `ss_net_paid_inc_tax` | `decimal(7,2)` | 4.5 | 617,795 | Net paid including tax |
| `ss_net_profit` | `decimal(7,2)` | 4.48 | 566,167 | Profit = net_paid - ext_wholesale_cost |
| `ss_sold_date_sk` | `int` | 4.48 | 1,824 | Date of sale → date_dim |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON store_sales.ss_sold_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.time_dim ON store_sales.ss_sold_time_sk = time_dim.t_time_sk
```
```sql
JOIN samples.tpcds_sf1.item ON store_sales.ss_item_sk = item.i_item_sk
```
```sql
JOIN samples.tpcds_sf1.customer ON store_sales.ss_customer_sk = customer.c_customer_sk
```

## Sample values

- `ss_store_sk`: 1, 4, 2, 8, 7, 10