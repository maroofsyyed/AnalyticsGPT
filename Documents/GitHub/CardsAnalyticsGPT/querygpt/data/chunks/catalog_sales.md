# Table: `catalog_sales`

**Type:** fact  
**Row count:** 1,439,935  
**Full path:** `samples.tpcds_sf1.catalog_sales`

**Description:** Phone/mail catalog sales. Sourced via call center and catalog pages.

**Primary key(s):** `cs_item_sk`, `cs_order_number`

**Foreign keys:**
- `cs_sold_date_sk` → `date_dim.d_date_sk`
- `cs_sold_time_sk` → `time_dim.t_time_sk`
- `cs_ship_date_sk` → `date_dim.d_date_sk`
- `cs_item_sk` → `item.i_item_sk`
- `cs_bill_customer_sk` → `customer.c_customer_sk`
- `cs_ship_customer_sk` → `customer.c_customer_sk`
- `cs_bill_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `cs_bill_hdemo_sk` → `household_demographics.hd_demo_sk`
- `cs_bill_addr_sk` → `customer_address.ca_address_sk`
- `cs_ship_addr_sk` → `customer_address.ca_address_sk`
- `cs_call_center_sk` → `call_center.cc_call_center_sk`
- `cs_catalog_page_sk` → `catalog_page.cp_catalog_page_sk`
- `cs_ship_mode_sk` → `ship_mode.sm_ship_mode_sk`
- `cs_warehouse_sk` → `warehouse.w_warehouse_sk`
- `cs_promo_sk` → `promotion.p_promo_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `cs_sold_date_sk` | `int` | 0.5 | 1,831 |  |
| `cs_sold_time_sk` | `int` | 0.5 | 67,578 |  |
| `cs_ship_date_sk` | `int` | 0.5 | 1,923 |  |
| `cs_bill_customer_sk` | `int` | 0.5 | 79,851 |  |
| `cs_bill_cdemo_sk` | `int` | 0.5 | 153,560 |  |
| `cs_bill_hdemo_sk` | `int` | 0.5 | 7,201 |  |
| `cs_bill_addr_sk` | `int` | 0.51 | 47,983 |  |
| `cs_ship_customer_sk` | `int` | 0.5 | 79,852 |  |
| `cs_ship_cdemo_sk` | `int` | 0.51 | 153,580 |  |
| `cs_ship_hdemo_sk` | `int` | 0.5 | 7,201 |  |
| `cs_ship_addr_sk` | `int` | 0.5 | 47,974 |  |
| `cs_call_center_sk` | `int` | 0.5 | 7 | Call center that handled order → call_center |
| `cs_catalog_page_sk` | `int` | 0.51 | 6,589 | Catalog page advertising the item → catalog_page |
| `cs_ship_mode_sk` | `int` | 0.51 | 21 | Shipping method → ship_mode |
| `cs_warehouse_sk` | `int` | 0.5 | 6 | Fulfilling warehouse → warehouse |
| `cs_item_sk` | `int` | 0.0 | 18,000 |  |
| `cs_promo_sk` | `int` | 0.5 | 301 |  |
| `cs_order_number` | `bigint` | 0.0 | 160,000 | Groups items in one catalog order |
| `cs_quantity` | `int` | 0.51 | 101 |  |
| `cs_wholesale_cost` | `decimal(7,2)` | 0.5 | 9,902 |  |
| `cs_list_price` | `decimal(7,2)` | 0.51 | 29,445 |  |
| `cs_sales_price` | `decimal(7,2)` | 0.5 | 26,101 |  |
| `cs_ext_discount_amt` | `decimal(7,2)` | 0.5 | 392,839 |  |
| `cs_ext_sales_price` | `decimal(7,2)` | 0.51 | 392,865 |  |
| `cs_ext_wholesale_cost` | `decimal(7,2)` | 0.5 | 342,003 |  |
| `cs_ext_list_price` | `decimal(7,2)` | 0.51 | 558,685 |  |
| `cs_ext_tax` | `decimal(7,2)` | 0.5 | 84,958 |  |
| `cs_coupon_amt` | `decimal(7,2)` | 0.5 | 156,949 |  |
| `cs_ext_ship_cost` | `decimal(7,2)` | 0.51 | 258,657 |  |
| `cs_net_paid` | `decimal(7,2)` | 0.5 | 423,319 | Amount paid |
| `cs_net_paid_inc_tax` | `decimal(7,2)` | 0.5 | 539,210 |  |
| `cs_net_paid_inc_ship` | `decimal(7,2)` | 0.0 | 544,276 |  |
| `cs_net_paid_inc_ship_tax` | `decimal(7,2)` | 0.0 | 700,302 |  |
| `cs_net_profit` | `decimal(7,2)` | 0.0 | 491,880 | Profit |
| `cs_sold_date_sk` | `int` | 0.5 | 1,831 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON catalog_sales.cs_sold_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.time_dim ON catalog_sales.cs_sold_time_sk = time_dim.t_time_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON catalog_sales.cs_ship_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.item ON catalog_sales.cs_item_sk = item.i_item_sk
```

## Sample values

- `cs_call_center_sk`: 1, 4, 5, 3, 2, 6
- `cs_ship_mode_sk`: 17, 8, 1, 16, 9, 7
- `cs_warehouse_sk`: 1, 4, 5, 3, 2