# Record production (partial completion)

Production operators report how many units of a line are completed (for example **5** of **50** banners). The backend:

- increases **`quantityProduced`** on that order item by **`additionalQuantity`**
- deducts **`(additionalQuantity / quantity) * unit`** from **operator stock** for the line’s `itemId` (same rule as full print, but proportional), **except** for **non-stock services** (`isNonStockService: true`), where only the counters are updated
- when **`quantityProduced`** reaches **`quantity`**, sets the line **`status`** to **`Printed`** and refreshes the parent order status

## Endpoint

```http
POST /api/v1/order-items/{orderItemId}/record-production
Content-Type: application/json
```

### Body

```json
{
  "additionalQuantity": 5
}
```

### Response

Returns the updated order item (same shape as `GET` single item), including `quantityProduced`.

### Derived values (frontend)

- **Remaining to produce:** `quantity - quantityProduced`

### Errors

- **400** if `additionalQuantity` is missing, not positive, or exceeds remaining quantity
- **404** if order item not found
- **409** if stock is insufficient (stock services only)

## Migration

Requires column `order_items.quantityProduced` (default `0`). Run:

```bash
npm run build
npm run migration:run
```

## Legacy: status `Printed` without using record-production

If **`quantityProduced`** is **0** and the line moves to **`Printed`** / **`Void`** (existing PATCH flow), the backend still deducts the **full `unit`** once and sets **`quantityProduced`** to **`quantity`** so stock restore remains consistent.

If **`quantityProduced`** is already between **0** and **`quantity`** (partial production recorded), moving to **`Printed`** only deducts the **remaining** fraction of **`unit`** and sets **`quantityProduced`** to **`quantity`**.
