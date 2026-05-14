# Print / Quality Control / Delivery (partial flow)

This guide documents the step-based flow for order line items where quantities can be partial at each step.

Important: **Printing and production are the same step** in this backend. Both “record production” and “record print” advance the same counter: `quantityProduced`.

Flows:

- record production/print → quality control → delivered
- print all → quality control → delivered

Each step appends a row to `order_item_events`, so every line item has a complete history.

## Endpoints

### Print

```http
POST /api/v1/order-items/{orderItemId}/record-print
Content-Type: application/json
```

Body:

```json
{ "mode": "ALL" }
```

```json
{ "mode": "COMPLETED" }
```

```json
{ "mode": "CUSTOM", "quantity": 5 }
```

Rules:

- `ALL` advances `quantityProduced` to full: `quantity - quantityProduced`
- `COMPLETED` is not meaningful when printing==production (completed == produced)
- `CUSTOM` advances by an explicit quantity, bounded by remaining

### Quality control

```http
POST /api/v1/order-items/{orderItemId}/record-quality-control
Content-Type: application/json
```

```json
{ "additionalQuantity": 5 }
```

Rules:

- QC can only be recorded for completed/printed units: it is bounded by `quantityProduced - quantityQualityControlled`

### Delivery (partial supported)

```http
POST /api/v1/order-items/{orderItemId}/record-delivery
Content-Type: application/json
```

```json
{ "additionalQuantity": 5 }
```

Rules:

- Delivery can only be recorded for QC units: it is bounded by `quantityQualityControlled - quantityDelivered`
- If the order has `paymentTerm.forcePayment=true`, delivery is blocked while `remainingAmount > 0`

## Status behavior

Line-item `status` is derived from cumulative quantities:

- Fully delivered → `Delivered`
- Partially delivered → `Until Delivery`
- Fully QC → `Completed`
- Partially QC → `Quality Control`
- Fully produced/printed → `Printed`
- Partially produced/printed → `Production`

