# Frontend Report Integration Guide

This guide explains how the frontend should integrate with the company profit report endpoint.

## Overview

- **Endpoint:** `GET /api/v1/reports/company-profit`
- **Auth:** Required, send `Authorization: Bearer {accessToken}`
- **Content-Type:** `application/json`
- **Base URL:** `{host}/api/v1`

This report is designed for a finance dashboard or reporting screen that shows:

- report filters
- KPI summary cards
- daily profit/loss trend
- fixed-cost breakdown
- paginated order profitability table

## Query Parameters

| Parameter | Type | Required | Notes |
|----------|------|----------|------|
| `page` | number | No | Default `1` |
| `limit` | number | No | Default `20`, max `200` |
| `startDate` | string | No | Must be `YYYY-MM-DD` |
| `endDate` | string | No | Must be `YYYY-MM-DD` |
| `search` | string | No | Matches order id, series, customer, sales partner, item/service names, and descriptions |
| `items` | string or string[] | No | Can be repeated, for example `?items=Banner&items=Sticker`, or comma-separated |

## Date Rules

- `startDate` and `endDate` must be provided together
- dates must use `YYYY-MM-DD`
- if no date range is sent, the backend derives the period from the matched orders

## Example Requests

### Basic

```http
GET /api/v1/reports/company-profit?page=1&limit=20
Authorization: Bearer {accessToken}
```

### With Date Range

```http
GET /api/v1/reports/company-profit?startDate=2026-04-01&endDate=2026-04-30&page=1&limit=20
Authorization: Bearer {accessToken}
```

### With Item Filters

```http
GET /api/v1/reports/company-profit?startDate=2026-04-01&endDate=2026-04-30&items=Banner&items=Sticker
Authorization: Bearer {accessToken}
```

### With Search

```http
GET /api/v1/reports/company-profit?startDate=2026-04-01&endDate=2026-04-30&search=Acme
Authorization: Bearer {accessToken}
```

## Response Shape

```ts
type CompanyProfitReportResponse = {
  filters: {
    startDate: string | null;
    endDate: string | null;
    search: string | null;
    items: string[];
  };
  period: {
    startDate: string | null;
    endDate: string | null;
    days: number;
    hasExplicitRange: boolean;
  };
  allocation: {
    commission: string;
    fixedCost: string;
    revenue: string;
  };
  fixedCosts: {
    items: Array<{
      id: string;
      description: string;
      monthlyFixedCost: number;
      dailyFixedCost: number;
      effectiveDailyFixedCost: number;
      periodCost: number;
    }>;
    totalDailyFixedCost: number;
    totalPeriodFixedCost: number;
    reportDays: number;
  };
  summary: {
    orderCount: number;
    itemCount: number;
    totalQuantity: number;
    totalSales: number;
    totalTax: number;
    totalGrandTotal: number;
    totalCost: number;
    totalCommission: number;
    grossProfit: number;
    allocatedFixedCost: number;
    netProfitLoss: number;
    profitableOrdersCount: number;
    lossMakingOrdersCount: number;
    breakEvenOrdersCount: number;
    profitValue: number;
    lossValue: number;
    dailyFixedCost: number;
    reportDays: number;
    totalFixedCostForPeriod: number;
    unallocatedFixedCost: number;
    companyNetProfitLoss: number;
    averageOrderSales: number;
    averageOrderNetProfitLoss: number;
  };
  dailyBreakdown: Array<{
    date: string;
    ordersCount: number;
    totalSales: number;
    totalTax: number;
    totalGrandTotal: number;
    totalCost: number;
    totalCommission: number;
    grossProfit: number;
    allocatedFixedCost: number;
    fixedCostForDay: number;
    unallocatedFixedCost: number;
    netProfitLoss: number;
    companyNetProfitLoss: number;
  }>;
  orders: Array<{
    orderId: string;
    series: string;
    orderDate: string;
    customerName: string;
    salesPartnerName: string | null;
    status: string;
    orderSource: string;
    itemCount: number;
    totalQuantity: number;
    totalSales: number;
    tax: number;
    grandTotal: number;
    totalCost: number;
    totalCommission: number;
    grossProfit: number;
    fixedCostAllocation: number;
    netProfitLoss: number;
    profitabilityStatus: 'profit' | 'loss' | 'break-even';
    netMarginPercent: number;
    itemNames: string[];
    serviceNames: string[];
  }>;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
```

## How The Numbers Work

The frontend should display these values as returned and should not recalculate business formulas differently.

### Revenue Source

- `totalSales` is the invoiced order revenue before tax
- when there is no item filter, the backend uses `order.totalAmount` as the authoritative sales value
- when item filters are used, the backend uses matching order item `totalAmount` values
- the report no longer uses the inflated `orderItem.sales` production field as the primary revenue source

### Commission

- commission is recognized from `commission.totalAmount`
- if `totalAmount` is missing, the backend falls back to commission transaction totals

### Fixed Cost

- fixed costs come from the `fixed_cost` table
- each fixed-cost row exposes:
  - `dailyFixedCost`
  - `monthlyFixedCost`
  - `effectiveDailyFixedCost`
  - `periodCost`
- the report totals expose:
  - `totalDailyFixedCost`
  - `totalPeriodFixedCost`

### Profit And Loss

- `grossProfit = totalSales - totalCost - totalCommission`
- `netProfitLoss = grossProfit - fixedCostAllocation`
- `companyNetProfitLoss = grossProfit - total fixed cost for the whole period`

Important:

- `summary.netProfitLoss` is the sum of the displayed order rows
- `summary.companyNetProfitLoss` subtracts the full period fixed cost, including any unallocated fixed cost
- if item filters are used, fixed cost is prorated by the filtered sales share
- `summary.totalGrandTotal = summary.totalSales + summary.totalTax`

## Recommended Screen Layout

### 1. Filter Bar

Use:

- date range picker
- text search
- multi-select item/service filter
- page size selector
- refresh button

The frontend should always keep filter state in the URL or a central query state so the screen is shareable.

### 2. KPI Cards

Recommended cards:

- Total Sales -> `summary.totalSales`
- Total Tax -> `summary.totalTax`
- Total Invoice Amount -> `summary.totalGrandTotal`
- Total Cost -> `summary.totalCost`
- Total Commission -> `summary.totalCommission`
- Gross Profit -> `summary.grossProfit`
- Fixed Cost For Period -> `summary.totalFixedCostForPeriod`
- Company Net Profit/Loss -> `summary.companyNetProfitLoss`
- Profit Orders -> `summary.profitableOrdersCount`
- Loss Orders -> `summary.lossMakingOrdersCount`

### 3. Daily Trend Chart

Use `dailyBreakdown` for:

- line chart: `date` vs `companyNetProfitLoss`
- line chart: `date` vs `totalSales`
- line chart: `date` vs `totalGrandTotal`
- stacked bars: `grossProfit`, `fixedCostForDay`

Recommended x-axis:

- ascending by date in the chart

### 4. Fixed Cost Table

Use `fixedCosts.items` to show:

- description
- monthly fixed cost
- daily fixed cost
- effective daily fixed cost
- period cost

Footer totals:

- `fixedCosts.totalDailyFixedCost`
- `fixedCosts.totalPeriodFixedCost`

### 5. Orders Profitability Table

Use `orders` for the main table.

Recommended columns:

- Order Date
- Order Series
- Customer
- Sales Partner
- Status
- Source
- Items
- Services
- Quantity
- Sales
- Tax
- Grand Total
- Cost
- Commission
- Gross Profit
- Fixed Cost Allocation
- Net Profit/Loss
- Margin %
- Profitability Status

Formatting suggestions:

- join `itemNames` with `, `
- join `serviceNames` with `, `
- color `profitabilityStatus`
  - `profit` -> green
  - `loss` -> red
  - `break-even` -> neutral

## Pagination

Use the `pagination` object directly:

- `page`
- `limit`
- `totalItems`
- `totalPages`
- `hasNextPage`
- `hasPreviousPage`

When the user changes page or page size, refetch the endpoint with the new values.

## Frontend TypeScript Example

```ts
export type CompanyProfitReportFilters = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  items?: string[];
};

export async function fetchCompanyProfitReport(
  baseUrl: string,
  token: string,
  filters: CompanyProfitReportFilters,
) {
  const params = new URLSearchParams();

  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.search) params.set('search', filters.search);

  for (const item of filters.items ?? []) {
    params.append('items', item);
  }

  const response = await fetch(
    `${baseUrl}/api/v1/reports/company-profit?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch report: ${response.status}`);
  }

  return response.json();
}
```

## React Query Example

```ts
import { useQuery } from '@tanstack/react-query';

export function useCompanyProfitReport(
  baseUrl: string,
  token: string,
  filters: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    items?: string[];
  },
) {
  return useQuery({
    queryKey: ['company-profit-report', filters],
    queryFn: () => fetchCompanyProfitReport(baseUrl, token, filters),
    enabled: Boolean(token),
  });
}
```

## UI State Recommendations

### Loading State

- show skeleton cards for the KPI summary
- show a skeleton table for orders
- keep previous page data while fetching next page if possible

### Empty State

If the API returns:

- `orders.length === 0`
- `summary.orderCount === 0`

show:

- "No report data found for the selected filters."

### Error State

Show backend validation messages when available. Common cases:

- `page must be a positive integer`
- `limit must be between 1 and 200`
- `startDate and endDate must be provided together`
- `Dates must use the YYYY-MM-DD format`
- `startDate must be before or equal to endDate`

## Display Rules

- Format money consistently with your app currency formatter
- Format percentages with 1 to 2 decimal places
- Treat negative `netProfitLoss` and `companyNetProfitLoss` as loss values
- Do not recompute totals in the UI unless required for presentation-only grouping
- Prefer backend values as the source of truth

## Recommended Implementation Order

1. Add the API client and TypeScript response type
2. Build the filter bar
3. Render KPI cards from `summary`
4. Render the daily trend chart from `dailyBreakdown`
5. Render the fixed-cost table from `fixedCosts.items`
6. Render the orders table from `orders`
7. Connect pagination to `pagination`
8. Add loading, empty, and error states

## Notes For The Frontend Team

- the report route is protected
- the report is paginated at the order row level
- if the frontend needs export support later, add a separate export endpoint instead of exporting the paginated response directly
- if the frontend needs chart-specific totals, reuse `summary` and `dailyBreakdown` instead of re-aggregating `orders`
