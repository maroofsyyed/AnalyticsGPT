# Table: `inventory`

**Type:** fact  
**Row count:** 11,745,000  
**Full path:** `samples.tpcds_sf1.inventory`

**Description:** Weekly stock snapshot per item per warehouse. No customer info.

**Primary key(s):** `inv_date_sk`, `inv_item_sk`, `inv_warehouse_sk`

**Foreign keys:**
- `inv_date_sk` → `date_dim.d_date_sk`
- `inv_item_sk` → `item.i_item_sk`
- `inv_warehouse_sk` → `warehouse.w_warehouse_sk`

## Columns

| Column | Type | Nulls% | Distinct | Business meaning |
|--------|------|-------:|---------:|-----------------|
| `inv_date_sk` | `int` | 0.0 | 261 | Snapshot week → date_dim |
| `inv_item_sk` | `int` | 0.0 | 18,000 | Item → item |
| `inv_warehouse_sk` | `int` | 0.0 | 5 | Warehouse → warehouse |
| `inv_quantity_on_hand` | `int` | 5.0 | 1,002 | Units in stock at end of week |
| `inv_date_sk` | `int` | 0.0 | 261 | Snapshot week → date_dim |

## JOIN patterns

```sql
JOIN samples.tpcds_sf1.date_dim ON inventory.inv_date_sk = date_dim.d_date_sk
```
```sql
JOIN samples.tpcds_sf1.item ON inventory.inv_item_sk = item.i_item_sk
```
```sql
JOIN samples.tpcds_sf1.warehouse ON inventory.inv_warehouse_sk = warehouse.w_warehouse_sk
```

## Sample values

- `inv_warehouse_sk`: 5, 4, 1, 3, 2