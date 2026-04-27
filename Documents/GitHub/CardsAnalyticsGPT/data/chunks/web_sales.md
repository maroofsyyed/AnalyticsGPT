# Table: `web_sales`

**Type:** fact  
**Row count:** 718,931  
**Full path:** `samples.tpcds_sf1.web_sales`

**Description:** Online sales. Has both bill-to and ship-to customer/address fields.

**Primary key(s):** `ws_item_sk`, `ws_order_number`

**Foreign keys:**
- `ws_sold_date_sk` → `date_dim.d_date_sk`
- `ws_sold_time_sk` → `time_dim.t_time_sk`
- `ws_ship_date_sk` → `date_dim.d_date_sk`
- `ws_item_sk` → `item.i_item_sk`
- `ws_bill_customer_sk` → `customer.c_customer_sk`
- `ws_ship_customer_sk` → `customer.c_customer_sk`
- `ws_bill_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `ws_bill_hdemo_sk` → `household_demographics.hd_demo_sk`
- `ws_bill_addr_sk` → `customer_address.ca_address_sk`
- `ws_ship_addr_sk` → `customer_address.ca_address_sk`
- `ws_web_page_sk` → `web_page.wp_web_page_sk`
- `ws_web_site_sk` → `web_site.web_site_sk`
- `ws_ship_mode_sk` → `ship_mode.sm_ship_mode_sk`
- `ws_warehouse_sk` → `warehouse.w_warehouse_sk`
- `ws_promo_sk` → `promotion.p_promo_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `ws_sold_date_sk` | `int` | 0.02 | 1,824 |  |
| `ws_sold_time_sk` | `int` | 0.02 | 40,959 |  |
| `ws_ship_date_sk` | `int` | 0.02 | 1,947 | Date shipped (may differ from sold date) |
| `ws_item_sk` | `int` | 0.0 | 18,000 |  |
| `ws_bill_customer_sk` | `int` | 0.02 | 45,113 | Customer who placed the order |
| `ws_bill_cdemo_sk` | `int` | 0.02 | 59,093 |  |
| `ws_bill_hdemo_sk` | `int` | 0.02 | 7,199 |  |
| `ws_bill_addr_sk` | `int` | 0.03 | 34,926 | Billing address |
| `ws_ship_customer_sk` | `int` | 0.02 | 45,196 | Customer who receives shipment (may differ) |
| `ws_ship_cdemo_sk` | `int` | 0.02 | 59,057 |  |
| `ws_ship_hdemo_sk` | `int` | 0.02 | 7,199 |  |
| `ws_ship_addr_sk` | `int` | 0.02 | 34,913 | Shipping address |
| `ws_web_page_sk` | `int` | 0.02 | 61 | Web page where ordered → web_page |
| `ws_web_site_sk` | `int` | 0.02 | 31 | Website that processed order → web_site |
| `ws_ship_mode_sk` | `int` | 0.02 | 21 | Shipping method → ship_mode |
| `ws_warehouse_sk` | `int` | 0.02 | 6 | Warehouse that fulfilled → warehouse |
| `ws_promo_sk` | `int` | 0.02 | 301 |  |
| `ws_order_number` | `bigint` | 0.0 | 60,000 | Groups items in one web order (≈ ss_ticket_number) |
| `ws_quantity` | `int` | 0.03 | 101 |  |
| `ws_wholesale_cost` | `decimal(7,2)` | 0.02 | 9,902 |  |
| `ws_list_price` | `decimal(7,2)` | 0.03 | 29,071 |  |
| `ws_sales_price` | `decimal(7,2)` | 0.02 | 24,629 |  |
| `ws_ext_discount_amt` | `decimal(7,2)` | 0.03 | 282,379 |  |
| `ws_ext_sales_price` | `decimal(7,2)` | 0.02 | 282,184 |  |
| `ws_ext_wholesale_cost` | `decimal(7,2)` | 0.02 | 272,488 |  |
| `ws_ext_list_price` | `decimal(7,2)` | 0.02 | 388,204 |  |
| `ws_ext_tax` | `decimal(7,2)` | 0.02 | 68,741 |  |
| `ws_coupon_amt` | `decimal(7,2)` | 0.02 | 96,729 |  |
| `ws_ext_ship_cost` | `decimal(7,2)` | 0.02 | 197,397 |  |
| `ws_net_paid` | `decimal(7,2)` | 0.02 | 298,039 | Amount paid |
| `ws_net_paid_inc_tax` | `decimal(7,2)` | 0.02 | 366,344 |  |
| `ws_net_paid_inc_ship` | `decimal(7,2)` | 0.0 | 371,956 |  |
| `ws_net_paid_inc_ship_tax` | `decimal(7,2)` | 0.0 | 460,464 |  |
| `ws_net_profit` | `decimal(7,2)` | 0.0 | 337,058 | Profit on this line |
| `ws_sold_date_sk` | `int` | 0.02 | 1,824 |  |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON web_sales.ws_sold_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.time_dim ON web_sales.ws_sold_time_sk = time_dim.t_time_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON web_sales.ws_ship_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.item ON web_sales.ws_item_sk = item.i_item_sk
```

## Sample values

- `ws_web_site_sk`: 16, 8, 25, 4, 22, 10
- `ws_ship_mode_sk`: 12, 16, 3, 8, 18, 9
- `ws_warehouse_sk`: 3, 4, 5, 1, 2