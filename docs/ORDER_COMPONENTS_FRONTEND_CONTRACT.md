# Order Components Frontend Contract

This guide explains how the frontend should send and display raw-material components for composite order items, such as an LED display made from LED modules, power supplies, controllers, frame material, and labor.

## Overview

- **Base URL:** `{host}/api/v1`
- **Content-Type:** `application/json`
- **Master BOM (catalog):** `POST|GET|PATCH|DELETE /api/v1/item-bom` — define raw materials once per sold item; see [Master BOM (catalog)](#master-bom-catalog).
- **Primary create endpoint:** `POST /api/v1/orders`
- **Primary update endpoint:** `PATCH /api/v1/orders/{orderId}`
- **Single order item create endpoint:** `POST /api/v1/order-items`
- **Single order item update endpoint:** `PATCH /api/v1/order-items/{orderItemId}`

Use `components` when one customer-facing order item is made from multiple raw materials. The customer still sees one sold item, while finance/reporting gets the true material cost breakdown.

You can either **maintain a master BOM** for the parent catalog item (recommended) and **omit** `components` on the order line, or **send an explicit** `components` array to override the BOM for that line only.

## Core Rule

Do not create each raw material as a separate `orderItems` row. Raw materials belong on the parent line as `components` **or** are copied from the master BOM when you omit `components` (see [Automatic resolution from BOM](#automatic-resolution-from-bom)).

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

### Master BOM types (catalog)

```ts
type ItemBomLineInput = {
  componentItemId: string;
  uomId: string;
  quantityPerUnit: number; // consumed per 1 unit of the parent catalog item
  width?: number; // optional, see "Area-based BOM lines" below
  height?: number; // must be sent together with width
  standardUnitCost?: number; // per UOM, OR per square unit when width & height set
  standardUnitSellingPrice?: number;
  description?: string;
  sortOrder?: number;
};

type CreateItemBomInput = {
  itemId: string; // parent catalog item (the item sold on the order)
  name?: string;
  isActive?: boolean; // default true; inactive BOMs are not expanded
  lines: ItemBomLineInput[]; // at least one line on create
};

type UpdateItemBomInput = {
  name?: string;
  isActive?: boolean;
  lines?: ItemBomLineInput[]; // if sent, replaces all lines; must be non-empty
};
```

## Master BOM (catalog)

Maintain one BOM per catalog `itemId`. The backend expands BOM lines into persisted `order_item_components` when an order line does not supply its own non-empty `components` array (rules below).

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/api/v1/item-bom` | Create BOM for an item. Fails with conflict if a BOM already exists for that `itemId` — use `PATCH` instead. |
| `GET` | `/api/v1/item-bom?page=1&limit=50` | List BOMs (paginated). |
| `GET` | `/api/v1/item-bom/item/:itemId` | Load BOM + lines for a catalog item (for pickers / previews). |
| `GET` | `/api/v1/item-bom/:id` | Load BOM by BOM id. |
| `PATCH` | `/api/v1/item-bom/:id` | Update name, `isActive`, and/or replace all `lines`. |
| `DELETE` | `/api/v1/item-bom/:id` | Delete BOM. |

**Costs on expansion:** for each BOM line, the backend uses `standardUnitCost` when set; otherwise it uses the minimum `pricing.costPrice` among pricings for `componentItemId`. Expanded rows get `quantity = quantityPerUnit * orderLineQuantity`. If the order line `quantity` is zero or negative, no components are created from the BOM.

### Area-based BOM lines (raw materials with fixed dimensions)

Some raw materials are consumed by **area** — for example, a vinyl panel sized `1.22m × 2.44m`, where the parent (e.g., LED display) needs 4 such panels per unit. Set `width` and `height` on the BOM line to model this. They are constant on the BOM (they describe the **piece** being consumed), independent of the order line's parent dimensions.

When **both** `width` and `height` are set on a BOM line:

- `component.quantity = quantityPerUnit * width * height * orderLineQuantity` (in the line's `uomId`, e.g., sqm)
- `standardUnitCost` is treated as **cost per square unit**
- `component.totalCost = component.quantity * standardUnitCost`
- The expanded `description` includes the per-piece dimensions, e.g., `"Vinyl panel (4 pcs @ 1.22x2.44)"`

When **neither** is set, behavior is unchanged: `quantity = quantityPerUnit * orderLineQuantity`, `unitCost` is per UOM.

You must send `width` and `height` together; sending only one is rejected.

## Automatic resolution from BOM

When saving order lines, the backend may fill `components` from the **active** BOM for that line’s `itemId`. A **non-empty** `components` array on the request always wins and is stored as sent.

| Action | `components` on request | Result |
| ------ | ------------------------ | ------ |
| `POST /orders` | Omitted, or `[]` | Expand from BOM if active BOM exists and line `quantity` &gt; 0; else no components. |
| `POST /orders` | Non-empty array | Use as sent (BOM ignored for that line). |
| `PATCH /orders` — **existing** line (`id` set) | Omitted | Keep existing stored components and their costs. |
| `PATCH /orders` — **existing** line | `[]` | Remove all components; `totalCost` from components becomes 0 for that update path. |
| `PATCH /orders` — **existing** line | Non-empty array | Replace components with payload. |
| `PATCH /orders` — **new** line (no `id`) | Omitted | Expand from BOM (same as create) when `quantity` &gt; 0. |
| `PATCH /orders` — **new** line | `[]` | No components (explicit empty; BOM not applied). |
| `POST /order-items` | Omitted | Expand from BOM when `quantity` &gt; 0. |
| `POST /order-items` | `[]` | No components (explicit empty). |
| `POST /order-items` | Non-empty array | Use as sent. |
| `PATCH /order-items` | Omitted | Does **not** re-resolve BOM; existing component rows unchanged. |
| `PATCH /order-items` | Provided (including `[]`) | Replace stored components with payload. |

**Takeaway for the UI:** For the common case, maintain BOMs under `/api/v1/item-bom` and **omit** `components` on order lines so materials and rolled-up cost are automatic. Send `components` only for one-off overrides.

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

If there are **no** persisted components for that line, the backend uses the existing **service/pricing-based** `totalCost` calculation instead. When components exist (from BOM expansion or explicit payload), line `totalCost` is driven by the sum of component line totals.

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

### Same order line using master BOM instead of inline `components`

If you already created a BOM with `POST /api/v1/item-bom` for `led-display-item-id`, the order line can **omit** `components`. The backend will persist the same style of `order_item_components` rows using `quantityPerUnit * quantity` and resolved unit costs.

```json
{
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
      "orderItemNotes": []
    }
  ]
}
```

On `POST /orders`, `components: []` is treated like omitted (BOM expansion still runs). On `POST /order-items`, `[]` means **no** materials — use omission when you want the BOM.

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

Important update behavior (**existing** order item row, `id` present):

- If `components` is provided, existing components for that order item are replaced.
- If `components` is an empty array, existing components are removed and `totalCost` becomes `0` for that component-based item update.
- If `components` is omitted, existing components are kept and continue to drive the saved `totalCost`.

For **new** lines added in the same `PATCH` (no `id`), see [Automatic resolution from BOM](#automatic-resolution-from-bom).

## Single Order Item Endpoints

You can also use the order item endpoints directly.

```http
POST /api/v1/order-items
PATCH /api/v1/order-items/{orderItemId}
GET /api/v1/order-items/{orderId}
GET /api/v1/order-items/all
```

The same `components` field is accepted on create/update and returned on reads. On **`POST`**, omitted `components` triggers BOM expansion; on **`PATCH`**, omitting `components` leaves existing component rows unchanged.

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

- **BOM admin:** Provide a screen to create/edit `/api/v1/item-bom` per catalog item so order entry does not require typing raw materials on every order.
- **Order entry:** When the user picks a parent item, optionally `GET /api/v1/item-bom/item/:itemId` to show a read-only preview of materials; still omit `components` on save unless the user overrides.
- Show components as a nested table under the parent order item when present on the response.
- Let users add/remove raw material rows when overriding the BOM before submit.
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

Migrations add at least:

- `order_item_components` — without it, persisting line components fails.
- `item_bom` and `item_bom_line` — master BOM storage; without them, BOM APIs and BOM expansion fail.
