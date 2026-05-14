# Pricing: standard BOM cost preview (API)

**Endpoint:** `GET /api/v1/pricing/standard-cost-preview`

**Query**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | UUID | Yes | Parent catalog item. |
| `serviceId` | UUID | Yes | Service used to match component **pricing** rows (`serviceId` or `nonStockServiceId`). |
| `nonStockService` | boolean | No | If `true`, match pricings with `nonStockServiceId = serviceId` and `isNonStockService = true`. |

**Response:** `methodology`, `suggestedCostPrice` (null if no BOM/lines), `currency` (`ETB`), `bomId`, `lines[]` with `unitCostSource` in `bom_line_standard | pricing | purchase_price`, `warnings[]`.

**Roll-up (single level, per 1 parent unit):**

- Discrete line: `quantityPerUnit × unitCost`
- Area line (`width` × `height` on BOM line): `quantityPerUnit × width × height × unitCost` (unit cost per square unit)

**Unit cost precedence per line:** BOM `standardUnitCost` → component pricing for same service → `items.purchase_price`.

Read-only; no DB writes.

**Version:** 2026-05-14
