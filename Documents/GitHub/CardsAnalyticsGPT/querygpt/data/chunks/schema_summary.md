# TPC-DS schema summary — all 24 tables

Dataset: `samples.tpcds_sf1` in Databricks.  
Retail analytics benchmark: 3 sales channels × 3 return channels × shared dimensions.

## Table inventory

| Table | Type | Rows | Columns | Description |
|-------|------|-----:|--------:|-------------|
| `call_center` | dimension | 6 | 31 | Call centers handling catalog channel orders. |
| `catalog_page` | dimension | 11,718 | 9 | Individual pages in printed/digital catalogs tied to catalog_sales. |
| `catalog_returns` | fact | 143,672 | 27 | Returns from catalog orders. |
| `catalog_sales` | fact | 1,439,935 | 34 | Phone/mail catalog sales. Sourced via call center and catalog pages. |
| `customer` | dimension | 100,000 | 19 | Customer master with demographics, address, first purchase dates. |
| `customer_address` | dimension | 50,000 | 13 | Addresses used for billing and shipping across all channels. |
| `customer_demographics` | dimension | 1,920,800 | 9 | Demographic profile: age group, gender, education, credit rating. |
| `date_dim` | dimension | 73,049 | 28 | Calendar dimension — every date 1900-2100 with fiscal and holiday flags. |
| `household_demographics` | dimension | 7,200 | 5 | Household-level demographics: income band, vehicle count, buy potential. |
| `income_band` | dimension | 20 | 3 | Income brackets referenced by household_demographics. |
| `inventory` | fact | 11,745,000 | 4 | Weekly stock snapshot per item per warehouse. No customer info. |
| `item` | dimension | 18,000 | 22 | Product catalog — all items ever sold across all channels. |
| `promotion` | dimension | 300 | 19 | Promotions applied to sales — channel flags and discount details. |
| `reason` | dimension | 35 | 3 | Return reason codes referenced by all three return fact tables. |
| `ship_mode` | dimension | 20 | 6 | Shipping methods: Express/Standard/Two-Day/Overnight etc. |
| `store` | dimension | 12 | 29 | Physical store locations with size, geography, staffing. |
| `store_returns` | fact | 288,279 | 20 | Items returned to physical stores. Links to store_sales via item_sk + ticke |
| `store_sales` | fact | 2,879,789 | 23 | Point-of-sale transactions at physical stores. One row per item per ticket. |
| `time_dim` | dimension | 86,400 | 10 | Time-of-day dimension in seconds. 86400 rows = every second in a day. |
| `warehouse` | dimension | 5 | 14 | Fulfilment warehouses used in web and catalog sales. |
| `web_page` | dimension | 60 | 14 | Individual product/category pages on the website. |
| `web_returns` | fact | 71,772 | 24 | Returns from web orders. |
| `web_sales` | fact | 718,931 | 34 | Online sales. Has both bill-to and ship-to customer/address fields. |
| `web_site` | dimension | 30 | 26 | Website entities that run web sales channels. |

## Key design patterns

1. **Surrogate keys** — all dimension PKs end in `_sk` (integer). Natural keys end in `_id` (string).
2. **Date joins** — always join via `date_dim.d_date_sk`. Never filter on raw date columns in fact tables.
3. **Multi-channel union** — store/web/catalog facts have identical metric columns, safe to UNION ALL.
4. **Returns linkage** — returns join to sales via `item_sk + ticket_number/order_number`, not customer.
5. **Dual address** — web/catalog sales have separate `bill_addr_sk` and `ship_addr_sk` FKs.
6. **Dual customer** — web/catalog have `bill_customer_sk` and `ship_customer_sk` — different people.
7. **Inventory** — only fact with a composite 3-column PK: date + item + warehouse.
8. **YoY queries** — use `d_same_day_ly` in date_dim to find same day last year without self-join.