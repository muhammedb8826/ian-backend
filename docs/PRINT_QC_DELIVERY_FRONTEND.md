# Print / Quality Control / Delivery (partial flow)

This guide documents the step-based flow for order line items where quantities can be partial at each step:

- production recorded → print recorded (remaining stays unprinted) → quality control → delivered
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

- `ALL` prints everything remaining: `quantity - quantityPrinted`
- `COMPLETED` prints only what is already produced but still unprinted: `quantityProduced - quantityPrinted`
- `CUSTOM` prints an explicit quantity, bounded by remaining to print

If you print without prior production records (the **print all** flow), the backend will **advance `quantityProduced` up to the printed quantity** and deduct operator stock proportionally (stock services only).

### Quality control

```http
POST /api/v1/order-items/{orderItemId}/record-quality-control
Content-Type: application/json
```

```json
{ "additionalQuantity": 5 }
```

Rules:

- QC can only be recorded for printed units: it is bounded by `quantityPrinted - quantityQualityControlled`

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
- Fully printed → `Printed`
- Partially printed → `Printing`
- Produced but not printed yet → `Production`

