# Order Components Frontend Contract

This guide explains how the frontend should send and display raw-material components for composite order items, such as an LED display made from LED modules, power supplies, controllers, frame material, and labor.

## Overview

- **Base URL:** `{host}/api/v1`
- **Content-Type:** `application/json`
- **Primary create endpoint:** `POST /api/v1/orders`
- **Primary update endpoint:** `PATCH /api/v1/orders/{orderId}`
- **Single order item create endpoint:** `POST /api/v1/order-items`
- **Single order item update endpoint:** `PATCH /api/v1/order-items/{orderItemId}`

Use `components` when one customer-facing order item is made from multiple raw materials. The customer still sees one sold item, while finance/reporting gets the true material cost breakdown.

## Core Rule

Do not create each raw material as a separate `orderItems` row. Send raw materials inside the parent order item's `components` array.

Example:

- Parent order item: `LED Display 3m x 2m`
- Components:
  - LED module
  - power supply
  - controller
  - aluminum frame
  - installation labor item/service, if tracked as an item

## TypeScript Types

```ts
type OrderItemComponentInput = {
  id?: string;
  orderItemId?: string;
  itemId: string;
  uomId: string;
  quantity: number;
  unitCost: number;
  unitSellingPrice?: number;
  totalCost?: number;
  description?: string;
  notes?: string;
};

type OrderItemInput = {
  id?: string;
  orderId?: string;
  itemId: string;
  serviceId?: string;
  nonStockServiceId?: string;
  isNonStockService?: boolean;
  width?: number;
  height?: number;
  pricingId: string;
  unit: number;
  baseUomId: string;
  discount?: number;
  level: number;
  totalAmount: number;
  adminApproval: boolean;
  uomId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  isDiscounted: boolean;
  status: string;
  orderItemNotes?: string[];
  components?: OrderItemComponentInput[];
};
```

## Component Fields

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `itemId` | string | Yes | Raw material item id |
| `uomId` | string | Yes | UOM used for this raw material |
| `quantity` | number | Yes | Raw material quantity |
| `unitCost` | number | Yes | Cost per unit, snapshotted for this order |
| `unitSellingPrice` | number | No | Optional component-level sale/markup reference |
| `totalCost` | number | No | If omitted, backend calculates `quantity * unitCost`. If you send `0` but `quantity * unitCost` is greater than zero, the backend treats `0` as a placeholder and stores the computed total (common when the UI initializes `totalCost` to zero). |
| `description` | string | No | Short display label or override |
| `notes` | string | No | Internal notes |

## Cost Calculation

For each component:

```ts
component.totalCost = component.totalCost ?? component.quantity * component.unitCost;
```

For the parent order item:

```ts
orderItem.totalCost = sum(orderItem.components[].totalCost);
```

If `components` is missing or empty, the backend keeps using the existing pricing-based cost calculation.

For profit reports:

```ts
grossProfit = orderItemSales - orderItemComponentCost;
```

## Create Order Example

```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer {accessToken}
```

```json
{
  "series": "ORD-LED-001",
  "customerId": "customer-id",
  "status": "Processing",
  "orderDate": "2026-05-02",
  "deliveryDate": "2026-05-07",
  "orderSource": "Walk-in",
  "totalAmount": 5000,
  "tax": 750,
  "grandTotal": 5750,
  "totalQuantity": 1,
  "fileNames": [],
  "adminApproval": false,
  "orderItems": [
    {
      "itemId": "led-display-item-id",
      "serviceId": "assembly-service-id",
      "isNonStockService": false,
      "pricingId": "pricing-id",
      "uomId": "sqm-uom-id",
      "baseUomId": "sqm-uom-id",
      "width": 3,
      "height": 2,
      "quantity": 1,
      "unit": 6,
      "unitPrice": 5000,
      "totalAmount": 5000,
      "discount": 0,
      "level": 0,
      "adminApproval": false,
      "description": "Outdoor LED display 3m x 2m",
      "isDiscounted": false,
      "status": "Received",
      "orderItemNotes": [],
      "components": [
        {
          "itemId": "led-module-item-id",
          "uomId": "pcs-uom-id",
          "quantity": 24,
          "unitCost": 12,
          "description": "LED modules"
        },
        {
          "itemId": "power-supply-item-id",
          "uomId": "pcs-uom-id",
          "quantity": 2,
          "unitCost": 35,
          "description": "Power supplies"
        },
        {
          "itemId": "controller-item-id",
          "uomId": "pcs-uom-id",
          "quantity": 1,
          "unitCost": 80,
          "description": "LED controller"
        }
      ]
    }
  ]
}
```

In this example, backend stores:

```ts
orderItem.totalCost = 24 * 12 + 2 * 35 + 1 * 80; // 438
orderItem.sales = existing sales calculation;
orderItem.totalAmount = 5000;
```

## Update Order Example

When updating an order through `PATCH /api/v1/orders/{orderId}`, include `components` on each order item you want to replace.

```json
{
  "orderItems": [
    {
      "id": "existing-order-item-id",
      "itemId": "led-display-item-id",
      "serviceId": "assembly-service-id",
      "pricingId": "pricing-id",
      "uomId": "sqm-uom-id",
      "baseUomId": "sqm-uom-id",
      "quantity": 1,
      "unit": 6,
      "unitPrice": 5000,
      "totalAmount": 5000,
      "level": 0,
      "adminApproval": false,
      "isDiscounted": false,
      "status": "Received",
      "components": [
        {
          "itemId": "led-module-item-id",
          "uomId": "pcs-uom-id",
          "quantity": 30,
          "unitCost": 12
        }
      ]
    }
  ]
}
```

Important update behavior:

- If `components` is provided, existing components for that order item are replaced.
- If `components` is an empty array, existing components are removed and `totalCost` becomes `0` for that component-based item update.
- If `components` is omitted, existing components are kept and continue to drive the saved `totalCost`.

## Single Order Item Endpoints

You can also use the order item endpoints directly.

```http
POST /api/v1/order-items
PATCH /api/v1/order-items/{orderItemId}
GET /api/v1/order-items/{orderId}
GET /api/v1/order-items/all
```

The same `components` field is accepted on create/update and returned on reads.

## Response Shape

Order and order item reads now include `components`.

```ts
type OrderItemComponentResponse = {
  id: string;
  orderItemId: string;
  itemId: string;
  uomId: string;
  quantity: number;
  unitCost: number;
  unitSellingPrice: number | null;
  totalCost: number;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    name: string;
    description?: string | null;
  };
  uom?: {
    id: string;
    name: string;
    abbreviation: string;
    conversionRate: number;
  };
};

type OrderItemResponse = OrderItemInput & {
  id: string;
  totalCost: number;
  sales: number;
  components: OrderItemComponentResponse[];
};
```

## Frontend UI Recommendations

- Show components as a nested table under the parent order item.
- Let users add/remove raw material rows before submitting the order.
- Calculate `quantity * unitCost` live in the UI for preview, but let the backend be the source of truth.
- Display parent item cost as the sum of component costs when components exist.
- Use existing item and UOM dropdowns for component `itemId` and `uomId`.

## Validation Notes

The frontend should validate before submit:

- every component has `itemId`
- every component has `uomId`
- `quantity` is greater than or equal to `0`
- `unitCost` is greater than or equal to `0`
- `totalCost`, if manually supplied, is greater than or equal to `0`

## Reporting Impact

Company profit reports now calculate order item cost using this priority:

1. Sum of `orderItem.components[].totalCost`, if components exist
2. Existing pricing/unit cost calculation
3. Existing `orderItem.totalCost` fallback

No separate frontend report request is needed. Existing report screens should automatically reflect more accurate profit once orders are created with components.

## Database Requirement

Backend deployment must run:

```bash
npm run migration:run
```

This creates the `order_item_components` table. Without the migration, create/update requests containing `components` will fail when the backend tries to save component rows.
