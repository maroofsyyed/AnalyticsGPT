# TPC-DS complete join graph

## How to read: `fact_column → dimension_table.dimension_pk`

## Core hub tables (joined by almost everything)
- `date_dim` — joined by every date column in every fact table
- `item` — joined by every sales/returns/inventory fact
- `customer` — joined by customer_sk in sales and returns
- `customer_demographics` — joined via cdemo_sk
- `customer_address` — joined via addr_sk (billing and shipping separately)

### store_sales  (pk: ss_item_sk, ss_ticket_number)
- `ss_sold_date_sk` → `date_dim.d_date_sk`
- `ss_sold_time_sk` → `time_dim.t_time_sk`
- `ss_item_sk` → `item.i_item_sk`
- `ss_customer_sk` → `customer.c_customer_sk`
- `ss_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `ss_hdemo_sk` → `household_demographics.hd_demo_sk`
- `ss_addr_sk` → `customer_address.ca_address_sk`
- `ss_store_sk` → `store.s_store_sk`
- `ss_promo_sk` → `promotion.p_promo_sk`

### web_sales  (pk: ws_item_sk, ws_order_number)
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

### catalog_sales  (pk: cs_item_sk, cs_order_number)
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

### store_returns  (pk: sr_item_sk, sr_ticket_number)
- `sr_returned_date_sk` → `date_dim.d_date_sk`
- `sr_return_time_sk` → `time_dim.t_time_sk`
- `sr_item_sk` → `item.i_item_sk`
- `sr_customer_sk` → `customer.c_customer_sk`
- `sr_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `sr_hdemo_sk` → `household_demographics.hd_demo_sk`
- `sr_addr_sk` → `customer_address.ca_address_sk`
- `sr_store_sk` → `store.s_store_sk`
- `sr_reason_sk` → `reason.r_reason_sk`

### web_returns  (pk: wr_item_sk, wr_order_number)
- `wr_returned_date_sk` → `date_dim.d_date_sk`
- `wr_return_time_sk` → `time_dim.t_time_sk`
- `wr_item_sk` → `item.i_item_sk`
- `wr_refunded_customer_sk` → `customer.c_customer_sk`
- `wr_refunded_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `wr_refunded_hdemo_sk` → `household_demographics.hd_demo_sk`
- `wr_refunded_addr_sk` → `customer_address.ca_address_sk`
- `wr_web_page_sk` → `web_page.wp_web_page_sk`
- `wr_reason_sk` → `reason.r_reason_sk`

### catalog_returns  (pk: cr_item_sk, cr_order_number)
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

### inventory  (pk: inv_date_sk, inv_item_sk, inv_warehouse_sk)
- `inv_date_sk` → `date_dim.d_date_sk`
- `inv_item_sk` → `item.i_item_sk`
- `inv_warehouse_sk` → `warehouse.w_warehouse_sk`

### customer  (pk: c_customer_sk)
- `c_current_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `c_current_hdemo_sk` → `household_demographics.hd_demo_sk`
- `c_current_addr_sk` → `customer_address.ca_address_sk`
- `c_first_shipto_date_sk` → `date_dim.d_date_sk`
- `c_first_sales_date_sk` → `date_dim.d_date_sk`

### household_demographics  (pk: hd_demo_sk)
- `hd_income_band_sk` → `income_band.ib_income_band_sk`

### promotion  (pk: p_promo_sk)
- `p_start_date_sk` → `date_dim.d_date_sk`
- `p_end_date_sk` → `date_dim.d_date_sk`
- `p_item_sk` → `item.i_item_sk`

### catalog_page  (pk: cp_catalog_page_sk)
- `cp_start_date_sk` → `date_dim.d_date_sk`
- `cp_end_date_sk` → `date_dim.d_date_sk`

### store  (pk: s_store_sk)
- `s_closed_date_sk` → `date_dim.d_date_sk`

### call_center  (pk: cc_call_center_sk)
- `cc_closed_date_sk` → `date_dim.d_date_sk`
- `cc_open_date_sk` → `date_dim.d_date_sk`

### web_page  (pk: wp_web_page_sk)
- `wp_creation_date_sk` → `date_dim.d_date_sk`
- `wp_access_date_sk` → `date_dim.d_date_sk`

### web_site  (pk: web_site_sk)
- `web_open_date_sk` → `date_dim.d_date_sk`
- `web_close_date_sk` → `date_dim.d_date_sk`
