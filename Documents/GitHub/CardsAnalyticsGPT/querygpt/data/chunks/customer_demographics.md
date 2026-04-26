# Table: `customer_demographics`

**Type:** dimension  
**Row count:** 1,920,800  
**Full path:** `samples.tpcds_sf1.customer_demographics`

**Description:** Demographic profile: age group, gender, education, credit rating.

**Primary key(s):** `cd_demo_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `cd_demo_sk` | `int` | 0.0 | 1,920,800 | Surrogate key |
| `cd_gender` | `string` | 0.0 | 2 | M or F |
| `cd_marital_status` | `string` | 0.0 | 5 | S=Single M=Married D=Divorced W=Widowed U=Unknown |
| `cd_education_status` | `string` | 0.0 | 7 | Primary/Secondary/College/Advanced Degree/Unknown |
| `cd_purchase_estimate` | `int` | 0.0 | 20 | Estimated annual purchase amount $ |
| `cd_credit_rating` | `string` | 0.0 | 4 | Good/High Risk/Low Risk/Unknown |
| `cd_dep_count` | `int` | 0.0 | 7 | Number of dependents |
| `cd_dep_employed_count` | `int` | 0.0 | 7 | Employed dependents |
| `cd_dep_college_count` | `int` | 0.0 | 7 | Dependents in college |

## Sample values

- `cd_gender`: M, F
- `cd_marital_status`: M, S, D, W, U
- `cd_education_status`: Primary, Secondary, College, 2 yr Degree, 4 yr Degree, Advanced Degree
- `cd_purchase_estimate`: 500, 1000, 1500, 2000, 2500, 3000
- `cd_credit_rating`: Good, Low Risk, High Risk, Unknown