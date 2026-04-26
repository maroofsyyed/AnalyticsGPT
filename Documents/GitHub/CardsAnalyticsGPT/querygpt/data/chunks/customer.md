# Table: `customer`

**Type:** dimension  
**Row count:** 100,000  
**Full path:** `samples.tpcds_sf1.customer`

**Description:** Customer master with demographics, address, first purchase dates.

**Primary key(s):** `c_customer_sk`

**Foreign keys:**
- `c_current_cdemo_sk` → `customer_demographics.cd_demo_sk`
- `c_current_hdemo_sk` → `household_demographics.hd_demo_sk`
- `c_current_addr_sk` → `customer_address.ca_address_sk`
- `c_first_shipto_date_sk` → `date_dim.d_date_sk`
- `c_first_sales_date_sk` → `date_dim.d_date_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `c_customer_sk` | `int` | 0.0 | 100,000 |  |
| `c_customer_id` | `string` | 0.0 | 100,000 | Natural business key (string) |
| `c_current_cdemo_sk` | `int` | 3.53 | 94,162 |  |
| `c_current_hdemo_sk` | `int` | 3.52 | 7,201 |  |
| `c_current_addr_sk` | `int` | 0.0 | 43,249 |  |
| `c_first_shipto_date_sk` | `int` | 3.49 | 3,652 |  |
| `c_first_sales_date_sk` | `int` | 3.45 | 3,652 |  |
| `c_salutation` | `string` | 3.54 | 7 | Mr/Mrs/Ms/Dr etc |
| `c_first_name` | `string` | 3.53 | 4,052 | First name |
| `c_last_name` | `string` | 3.56 | 4,978 | Last name |
| `c_preferred_cust_flag` | `string` | 3.49 | 3 |  |
| `c_birth_day` | `int` | 3.5 | 32 | Day of birth |
| `c_birth_month` | `int` | 3.55 | 13 | Month of birth |
| `c_birth_year` | `int` | 3.47 | 70 | Year of birth |
| `c_birth_country` | `string` | 3.54 | 212 |  |
| `c_login` | `string` | 100.0 | 1 |  |
| `c_email_address` | `string` | 3.58 | 96,419 | Email address |
| `c_last_review_date_sk` | `int` | 3.52 | 367 |  |
| `c_last_review_date` | `int` | 3.52 | 367 | Last product review date sk |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.customer_demographics ON customer.c_current_cdemo_sk = customer_demographics.cd_demo_sk
```
```sql
JOIN samples.tpcds_sf1.household_demographics ON customer.c_current_hdemo_sk = household_demographics.hd_demo_sk
```
```sql
JOIN samples.tpcds_sf1.customer_address ON customer.c_current_addr_sk = customer_address.ca_address_sk
```
```sql
JOIN samples.tpcds_sf1.date_dim ON customer.c_first_shipto_date_sk = date_dim.d_date_sk
```

## Sample values

- `c_customer_id`: AAAAAAAABAAAAAAA, AAAAAAAACAAAAAAA, AAAAAAAADAAAAAAA, AAAAAAAAEAAAAAAA, AAAAAAAAFAAAAAAA, AAAAAAAAGAAAAAAA
- `c_salutation`: Mrs., Dr., Ms., Sir, Mr., Miss
- `c_first_name`: Colleen, Sara, Gregory, Rita, Kathryn, Melissa
- `c_last_name`: Parker, Long, Mansfield, Barlow, Mckinnon, Marcotte
- `c_preferred_cust_flag`: N, Y