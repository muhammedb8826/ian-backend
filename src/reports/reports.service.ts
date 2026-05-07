import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Commission } from 'src/entities/commission.entity';
import { FixedCost } from 'src/entities/fixed-cost.entity';
import { OrderItems } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { CompanyProfitReportQueryDto } from './dto/company-profit-report-query.dto';

type ProfitabilityStatus = 'profit' | 'loss' | 'break-even';

interface CompanyProfitReportRequest extends CompanyProfitReportQueryDto {
  page: number;
  limit: number;
}

interface NormalizedReportFilters {
  page: number;
  limit: number;
  search?: string;
  items: string[];
  includeFixedCostAllocation: boolean;
  explicitRange?: ReportRange;
}

interface ReportRange {
  start: Date;
  end: Date;
  startDate: string;
  endDate: string;
  days: number;
}

interface FixedCostLine {
  id: string;
  description: string;
  monthlyFixedCost: number;
  dailyFixedCost: number;
  effectiveDailyFixedCost: number;
  periodCost: number;
}

interface FixedCostSummary {
  items: FixedCostLine[];
  totalDailyFixedCost: number;
  totalPeriodFixedCost: number;
  reportDays: number;
}

interface OrderItemAggregate {
  itemCount: number;
  totalQuantity: number;
  totalSales: number;
  totalCost: number;
  itemNames: string[];
  serviceNames: string[];
}

interface OrderReportRow {
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
  grossProfit: number;
  totalCommission: number;
  contributionProfit: number;
  fixedCostAllocation?: number;
  netProfitAfterFixedCost?: number;
  profitabilityStatus: ProfitabilityStatus;
  netMarginPercent: number;
  itemNames: string[];
  serviceNames: string[];
}

interface DailyBreakdownRow {
  date: string;
  ordersCount: number;
  totalSales: number;
  totalTax: number;
  totalGrandTotal: number;
  totalCost: number;
  grossProfit: number;
  totalCommission: number;
  contributionProfit: number;
  allocatedFixedCost?: number;
  fixedCostForDay: number;
  unallocatedFixedCost: number;
  netProfitAfterFixedCost: number;
  companyNetProfitLoss: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(FixedCost)
    private readonly fixedCostRepository: Repository<FixedCost>,
  ) {}

  async getCompanyProfitReport(query: CompanyProfitReportRequest) {
    const filters = this.normalizeFilters(query);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.salesPartner', 'salesPartner')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.item', 'item')
      .leftJoinAndSelect('orderItems.components', 'orderItemComponents')
      .leftJoinAndSelect('orderItemComponents.item', 'orderItemComponentItem')
      .leftJoinAndSelect('orderItemComponents.uom', 'orderItemComponentUom')
      .leftJoinAndSelect('orderItems.service', 'service')
      .leftJoinAndSelect('orderItems.nonStockService', 'nonStockService')
      .leftJoinAndSelect('orderItems.pricing', 'pricing')
      .leftJoinAndSelect('order.commission', 'commission')
      .leftJoinAndSelect('commission.transactions', 'commissionTransactions')
      .orderBy('order.orderDate', 'DESC')
      .addOrderBy('order.createdAt', 'DESC');

    this.applyFilters(queryBuilder, filters);

    const orders = await queryBuilder.getMany();
    const reportRange = this.resolveReportRange(orders, filters.explicitRange);
    const fixedCostSummary = await this.buildFixedCostSummary(reportRange?.days ?? 0);
    const ordersPerDay = this.countOrdersPerDay(orders);

    const orderRows = orders
      .map((order) =>
        this.buildOrderRow(
          order,
          filters.items,
          ordersPerDay,
          fixedCostSummary.totalDailyFixedCost,
          filters.includeFixedCostAllocation,
        ),
      )
      .filter((row): row is OrderReportRow => row !== null)
      .sort((left, right) => {
        const dateDiff =
          new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime();

        if (dateDiff !== 0) {
          return dateDiff;
        }

        return left.series.localeCompare(right.series);
      });

    const dailyBreakdown = this.buildDailyBreakdown(
      orderRows,
      reportRange,
      fixedCostSummary.totalDailyFixedCost,
    );

    const totalItems = orderRows.length;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / filters.limit);
    const page = totalPages === 0 ? 1 : Math.min(filters.page, totalPages);
    const skip = (page - 1) * filters.limit;
    const paginatedRows = orderRows.slice(skip, skip + filters.limit);

    const summary = this.buildSummary(orderRows, fixedCostSummary);

    return {
      filters: {
        startDate: reportRange?.startDate ?? null,
        endDate: reportRange?.endDate ?? null,
        search: filters.search ?? null,
        items: filters.items,
        includeFixedCostAllocation: filters.includeFixedCostAllocation,
      },
      period: {
        startDate: reportRange?.startDate ?? null,
        endDate: reportRange?.endDate ?? null,
        days: reportRange?.days ?? 0,
        hasExplicitRange: Boolean(filters.explicitRange),
      },
      allocation: {
        commission:
          'Commission expense is recognized from commission.totalAmount and falls back to recorded commission transactions when totalAmount is missing.',
        fixedCost:
          'Daily fixed cost is reported separately from order contribution profit. Per-order allocation is optional and only included when includeFixedCostAllocation=true.',
        revenue:
          'Revenue is taken from invoiced order totals before tax and falls back to order item invoice amounts for filtered item views.',
      },
      fixedCosts: fixedCostSummary,
      summary,
      dailyBreakdown,
      orders: paginatedRows,
      pagination: {
        page,
        limit: filters.limit,
        totalItems,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPreviousPage: totalPages > 0 && page > 1,
      },
    };
  }

  private normalizeFilters(query: CompanyProfitReportRequest): NormalizedReportFilters {
    const page = Number(query.page);
    const limit = Number(query.limit);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      throw new BadRequestException('limit must be between 1 and 200');
    }

    const search = query.search?.trim() || undefined;
    const items = this.normalizeItems(query.items);
    const includeFixedCostAllocation = this.parseBooleanFlag(
      query.includeFixedCostAllocation,
    );
    const startDate = query.startDate?.trim();
    const endDate = query.endDate?.trim();

    if ((startDate && !endDate) || (!startDate && endDate)) {
      throw new BadRequestException(
        'startDate and endDate must be provided together',
      );
    }

    let explicitRange: ReportRange | undefined;

    if (startDate && endDate) {
      const start = this.parseDateOnly(startDate, false);
      const end = this.parseDateOnly(endDate, true);

      if (start.getTime() > end.getTime()) {
        throw new BadRequestException('startDate must be before or equal to endDate');
      }

      explicitRange = {
        start,
        end,
        startDate,
        endDate,
        days: this.getInclusiveDayCount(startDate, endDate),
      };
    }

    return {
      page,
      limit,
      search,
      items,
      includeFixedCostAllocation,
      explicitRange,
    };
  }

  private parseBooleanFlag(value?: string): boolean {
    if (!value) {
      return false;
    }

    const normalizedValue = value.trim().toLowerCase();
    return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes';
  }

  private normalizeItems(items?: string | string[]): string[] {
    if (!items) {
      return [];
    }

    const rawValues = Array.isArray(items) ? items : [items];

    return [...new Set(
      rawValues
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean),
    )];
  }

  private applyFilters(
    queryBuilder: ReturnType<Repository<Order>['createQueryBuilder']>,
    filters: NormalizedReportFilters,
  ) {
    if (filters.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('order.id LIKE :search', { search: `%${filters.search}%` })
            .orWhere('order.series LIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('customer.fullName LIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('customer.phone LIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('salesPartner.fullName LIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('orderItems.description LIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('item.name LIKE :search', { search: `%${filters.search}%` })
            .orWhere('service.name LIKE :search', {
              search: `%${filters.search}%`,
            })
            .orWhere('nonStockService.name LIKE :search', {
              search: `%${filters.search}%`,
            });
        }),
      );
    }

    if (filters.items.length > 0) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          filters.items.forEach((itemFilter, index) => {
            const parameterName = `itemFilter${index}`;
            qb.orWhere(`item.name LIKE :${parameterName}`, {
              [parameterName]: `%${itemFilter}%`,
            })
              .orWhere(`service.name LIKE :${parameterName}`, {
                [parameterName]: `%${itemFilter}%`,
              })
              .orWhere(`nonStockService.name LIKE :${parameterName}`, {
                [parameterName]: `%${itemFilter}%`,
              });
          });
        }),
      );
    }

    if (filters.explicitRange) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: filters.explicitRange.start,
        endDate: filters.explicitRange.end,
      });
    }
  }

  private resolveReportRange(
    orders: Order[],
    explicitRange?: ReportRange,
  ): ReportRange | undefined {
    if (explicitRange) {
      return explicitRange;
    }

    if (orders.length === 0) {
      return undefined;
    }

    const sortedDates = orders
      .map((order) => this.formatDateKey(order.orderDate))
      .sort((left, right) => left.localeCompare(right));

    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    return {
      start: this.parseDateOnly(startDate, false),
      end: this.parseDateOnly(endDate, true),
      startDate,
      endDate,
      days: this.getInclusiveDayCount(startDate, endDate),
    };
  }

  private async buildFixedCostSummary(reportDays: number): Promise<FixedCostSummary> {
    const fixedCosts = await this.fixedCostRepository.find();

    const items = fixedCosts
      .map((fixedCost) => {
        const effectiveDailyFixedCost = this.getEffectiveDailyFixedCost(fixedCost);

        return {
          id: fixedCost.id,
          description: fixedCost.description,
          monthlyFixedCost: this.toNumber(fixedCost.monthlyFixedCost),
          dailyFixedCost: this.toNumber(fixedCost.dailyFixedCost),
          effectiveDailyFixedCost,
          periodCost: effectiveDailyFixedCost * reportDays,
        };
      })
      .sort((left, right) => left.description.localeCompare(right.description));

    const totalDailyFixedCost = items.reduce(
      (sum, fixedCost) => sum + fixedCost.effectiveDailyFixedCost,
      0,
    );

    return {
      items,
      totalDailyFixedCost,
      totalPeriodFixedCost: totalDailyFixedCost * reportDays,
      reportDays,
    };
  }

  private getEffectiveDailyFixedCost(fixedCost: FixedCost): number {
    const dailyFixedCost = this.toNumber(fixedCost.dailyFixedCost);
    const monthlyFixedCost = this.toNumber(fixedCost.monthlyFixedCost);

    if (dailyFixedCost > 0) {
      return dailyFixedCost;
    }

    if (monthlyFixedCost > 0) {
      return monthlyFixedCost / 30;
    }

    return 0;
  }

  private countOrdersPerDay(orders: Order[]): Map<string, number> {
    const orderCountByDate = new Map<string, number>();

    for (const order of orders) {
      const dateKey = this.formatDateKey(order.orderDate);
      orderCountByDate.set(dateKey, (orderCountByDate.get(dateKey) ?? 0) + 1);
    }

    return orderCountByDate;
  }

  private buildOrderRow(
    order: Order,
    itemFilters: string[],
    ordersPerDay: Map<string, number>,
    totalDailyFixedCost: number,
    includeFixedCostAllocation: boolean,
  ): OrderReportRow | null {
    const allItems = order.orderItems ?? [];
    const includedItems = this.filterOrderItems(allItems, itemFilters);

    if (includedItems.length === 0) {
      return null;
    }

    const fullAggregate = this.aggregateItems(allItems);
    const includedAggregate = this.aggregateItems(includedItems);
    const orderNetSales = this.getOrderNetSales(order, fullAggregate.totalSales);
    const totalSales =
      itemFilters.length > 0 ? includedAggregate.totalSales : orderNetSales;
    const scopeShare = this.getScopeShare(
      itemFilters.length > 0,
      orderNetSales,
      includedAggregate.totalSales,
      fullAggregate.itemCount,
      includedAggregate.itemCount,
    );
    const recognizedCommission = this.getRecognizedCommission(order.commission ?? []);
    const totalCommission = recognizedCommission * scopeShare;
    const grossProfit = totalSales - includedAggregate.totalCost;
    const contributionProfit = grossProfit - totalCommission;
    const tax = this.getOrderTax(order) * scopeShare;
    const grandTotal = this.getOrderGrandTotal(order, orderNetSales, this.getOrderTax(order)) * scopeShare;

    const orderDate = this.formatDateKey(order.orderDate);
    const ordersOnDate = ordersPerDay.get(orderDate) ?? 1;
    const fixedCostAllocation =
      ordersOnDate > 0 ? (totalDailyFixedCost / ordersOnDate) * scopeShare : 0;
    const netProfitAfterFixedCost = contributionProfit - fixedCostAllocation;

    return {
      orderId: order.id,
      series: order.series,
      orderDate,
      customerName: order.customer?.fullName || 'Unknown',
      salesPartnerName: order.salesPartner?.fullName || null,
      status: order.status,
      orderSource: order.orderSource,
      itemCount: includedAggregate.itemCount,
      totalQuantity: includedAggregate.totalQuantity,
      totalSales,
      tax,
      grandTotal,
      totalCost: includedAggregate.totalCost,
      grossProfit,
      totalCommission,
      contributionProfit,
      fixedCostAllocation: includeFixedCostAllocation ? fixedCostAllocation : undefined,
      netProfitAfterFixedCost: includeFixedCostAllocation
        ? netProfitAfterFixedCost
        : undefined,
      profitabilityStatus: this.getProfitabilityStatus(contributionProfit),
      netMarginPercent:
        totalSales > 0
          ? (contributionProfit / totalSales) * 100
          : 0,
      itemNames: includedAggregate.itemNames,
      serviceNames: includedAggregate.serviceNames,
    };
  }

  private filterOrderItems(orderItems: OrderItems[], itemFilters: string[]): OrderItems[] {
    if (itemFilters.length === 0) {
      return orderItems;
    }

    return orderItems.filter((orderItem) => {
      const haystacks = [
        orderItem.item?.name,
        orderItem.service?.name,
        orderItem.nonStockService?.name,
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());

      return itemFilters.some((itemFilter) =>
        haystacks.some((haystack) => haystack.includes(itemFilter.toLowerCase())),
      );
    });
  }

  private aggregateItems(orderItems: OrderItems[]): OrderItemAggregate {
    const itemNames = new Set<string>();
    const serviceNames = new Set<string>();

    const aggregate = orderItems.reduce<OrderItemAggregate>(
      (summary, orderItem) => {
        if (orderItem.item?.name) {
          itemNames.add(orderItem.item.name);
        }

        const serviceName =
          orderItem.nonStockService?.name || orderItem.service?.name || undefined;

        if (serviceName) {
          serviceNames.add(serviceName);
        }

        summary.itemCount += 1;
        summary.totalQuantity += this.toNumber(orderItem.quantity);
        summary.totalSales += this.getOrderItemSales(orderItem);
        summary.totalCost += this.getOrderItemCost(orderItem);
        return summary;
      },
      {
        itemCount: 0,
        totalQuantity: 0,
        totalSales: 0,
        totalCost: 0,
        itemNames: [],
        serviceNames: [],
      },
    );

    aggregate.itemNames = [...itemNames].sort((left, right) =>
      left.localeCompare(right),
    );
    aggregate.serviceNames = [...serviceNames].sort((left, right) =>
      left.localeCompare(right),
    );

    return aggregate;
  }

  private getOrderItemSales(orderItem: OrderItems): number {
    const totalAmount = this.toNumber(orderItem.totalAmount);

    if (totalAmount !== 0) {
      return totalAmount;
    }

    const unitPrice = this.toNumber(orderItem.unitPrice);

    if (unitPrice !== 0) {
      return unitPrice;
    }

    return this.toNumber(orderItem.sales);
  }

  private getOrderItemCost(orderItem: OrderItems): number {
    const componentsCost = (orderItem.components ?? []).reduce(
      (sum, component) => sum + this.toNumber(component.totalCost),
      0,
    );

    if ((orderItem.components?.length ?? 0) > 0) {
      return componentsCost;
    }

    const pricing = orderItem.pricing;
    const unit = this.toNumber(orderItem.unit);

    if (pricing && unit > 0) {
      const costPrice = this.toNumber(pricing.costPrice);
      const pricingWidth = this.toNumber(pricing.width);
      const pricingHeight = this.toNumber(pricing.height);
      const hasSizing = pricingWidth > 0 && pricingHeight > 0;

      if (hasSizing) {
        return (unit * costPrice) / (pricingWidth * pricingHeight);
      }

      return unit * costPrice;
    }

    return this.toNumber(orderItem.totalCost);
  }

  private getScopeShare(
    itemFilterApplied: boolean,
    fullOrderSales: number,
    includedSales: number,
    fullItemCount: number,
    includedItemCount: number,
  ): number {
    if (!itemFilterApplied) {
      return 1;
    }

    if (fullOrderSales > 0) {
      return includedSales / fullOrderSales;
    }

    if (fullItemCount > 0) {
      return includedItemCount / fullItemCount;
    }

    return 0;
  }

  private getOrderNetSales(order: Order, fallbackSales: number): number {
    const totalAmount = this.toNumber(order.totalAmount);

    if (totalAmount > 0) {
      return totalAmount;
    }

    const grandTotal = this.toNumber(order.grandTotal);
    const tax = this.toNumber(order.tax);

    if (grandTotal > 0 && tax >= 0) {
      const netSales = grandTotal - tax;

      if (netSales > 0) {
        return netSales;
      }
    }

    return fallbackSales;
  }

  private getOrderTax(order: Order): number {
    const tax = this.toNumber(order.tax);

    if (tax > 0) {
      return tax;
    }

    const totalAmount = this.toNumber(order.totalAmount);
    const grandTotal = this.toNumber(order.grandTotal);

    if (grandTotal > 0 && totalAmount > 0 && grandTotal >= totalAmount) {
      return grandTotal - totalAmount;
    }

    return 0;
  }

  private getOrderGrandTotal(order: Order, netSales: number, tax: number): number {
    const grandTotal = this.toNumber(order.grandTotal);

    if (grandTotal > 0) {
      return grandTotal;
    }

    return netSales + tax;
  }

  private getRecognizedCommission(commissions: Commission[]): number {
    return commissions.reduce((sum, commission) => {
      const declaredAmount = this.toNumber(commission.totalAmount);
      const paidAmount = this.toNumber(commission.paidAmount);
      const transactionAmount = (commission.transactions ?? []).reduce(
        (transactionSum, transaction) =>
          transactionSum + this.toNumber(transaction.amount),
        0,
      );

      if (declaredAmount > 0) {
        return sum + declaredAmount;
      }

      if (transactionAmount > 0) {
        return sum + transactionAmount;
      }

      return sum + paidAmount;
    }, 0);
  }

  private buildDailyBreakdown(
    orderRows: OrderReportRow[],
    reportRange: ReportRange | undefined,
    totalDailyFixedCost: number,
  ): DailyBreakdownRow[] {
    if (!reportRange) {
      return [];
    }

    const breakdownByDate = new Map<string, DailyBreakdownRow>();
    const currentDate = this.parseDateOnly(reportRange.startDate, false);
    const endDate = this.parseDateOnly(reportRange.endDate, false);

    while (currentDate.getTime() <= endDate.getTime()) {
      const dateKey = this.formatDateKey(currentDate);
      breakdownByDate.set(dateKey, {
        date: dateKey,
        ordersCount: 0,
        totalSales: 0,
        totalTax: 0,
        totalGrandTotal: 0,
        totalCost: 0,
        grossProfit: 0,
        totalCommission: 0,
        contributionProfit: 0,
        allocatedFixedCost: undefined,
        fixedCostForDay: totalDailyFixedCost,
        unallocatedFixedCost: totalDailyFixedCost,
        netProfitAfterFixedCost: -totalDailyFixedCost,
        companyNetProfitLoss: -totalDailyFixedCost,
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    for (const orderRow of orderRows) {
      const currentRow = breakdownByDate.get(orderRow.orderDate);

      if (!currentRow) {
        continue;
      }

      currentRow.ordersCount += 1;
      currentRow.totalSales += orderRow.totalSales;
      currentRow.totalTax += orderRow.tax;
      currentRow.totalGrandTotal += orderRow.grandTotal;
      currentRow.totalCost += orderRow.totalCost;
      currentRow.grossProfit += orderRow.grossProfit;
      currentRow.totalCommission += orderRow.totalCommission;
      currentRow.contributionProfit += orderRow.contributionProfit;
      currentRow.allocatedFixedCost =
        (currentRow.allocatedFixedCost ?? 0) + (orderRow.fixedCostAllocation ?? 0);
      currentRow.unallocatedFixedCost =
        currentRow.fixedCostForDay - (currentRow.allocatedFixedCost ?? 0);
      currentRow.netProfitAfterFixedCost =
        currentRow.contributionProfit - currentRow.fixedCostForDay;
      currentRow.companyNetProfitLoss =
        currentRow.contributionProfit - currentRow.fixedCostForDay;
    }

    return [...breakdownByDate.values()].sort((left, right) =>
      right.date.localeCompare(left.date),
    );
  }

  private buildSummary(orderRows: OrderReportRow[], fixedCostSummary: FixedCostSummary) {
    const summary = orderRows.reduce(
      (totals, row) => {
        totals.orderCount += 1;
        totals.itemCount += row.itemCount;
        totals.totalQuantity += row.totalQuantity;
        totals.totalSales += row.totalSales;
        totals.totalTax += row.tax;
        totals.totalGrandTotal += row.grandTotal;
        totals.totalCost += row.totalCost;
        totals.grossProfit += row.grossProfit;
        totals.totalCommission += row.totalCommission;
        totals.contributionProfit += row.contributionProfit;
        totals.allocatedFixedCost += row.fixedCostAllocation ?? 0;
        totals.netProfitAfterFixedCost += row.netProfitAfterFixedCost ?? 0;

        if (row.contributionProfit > 0) {
          totals.profitableOrdersCount += 1;
          totals.profitValue += row.contributionProfit;
        } else if (row.contributionProfit < 0) {
          totals.lossMakingOrdersCount += 1;
          totals.lossValue += Math.abs(row.contributionProfit);
        } else {
          totals.breakEvenOrdersCount += 1;
        }

        return totals;
      },
      {
        orderCount: 0,
        itemCount: 0,
        totalQuantity: 0,
        totalSales: 0,
        totalTax: 0,
        totalGrandTotal: 0,
        totalCost: 0,
        grossProfit: 0,
        totalCommission: 0,
        contributionProfit: 0,
        allocatedFixedCost: 0,
        netProfitAfterFixedCost: 0,
        profitableOrdersCount: 0,
        lossMakingOrdersCount: 0,
        breakEvenOrdersCount: 0,
        profitValue: 0,
        lossValue: 0,
      },
    );

    const unallocatedFixedCost =
      fixedCostSummary.totalPeriodFixedCost - summary.allocatedFixedCost;
    const netProfitAfterFixedCost =
      summary.contributionProfit - fixedCostSummary.totalPeriodFixedCost;

    return {
      ...summary,
      dailyFixedCost: fixedCostSummary.totalDailyFixedCost,
      reportDays: fixedCostSummary.reportDays,
      totalFixedCostForPeriod: fixedCostSummary.totalPeriodFixedCost,
      unallocatedFixedCost,
      netProfitAfterFixedCost,
      companyNetProfitLoss: netProfitAfterFixedCost,
      averageOrderSales:
        summary.orderCount > 0 ? summary.totalSales / summary.orderCount : 0,
      averageOrderContributionProfit:
        summary.orderCount > 0
          ? summary.contributionProfit / summary.orderCount
          : 0,
      averageOrderNetProfitAfterFixedCost:
        summary.orderCount > 0
          ? netProfitAfterFixedCost / summary.orderCount
          : 0,
    };
  }

  private getProfitabilityStatus(netProfitLoss: number): ProfitabilityStatus {
    if (netProfitLoss > 0) {
      return 'profit';
    }

    if (netProfitLoss < 0) {
      return 'loss';
    }

    return 'break-even';
  }

  private parseDateOnly(value: string, endOfDay: boolean): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      throw new BadRequestException(
        'Dates must use the YYYY-MM-DD format',
      );
    }

    const [, year, month, day] = match;

    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0,
      ),
    );
  }

  private getInclusiveDayCount(startDate: string, endDate: string): number {
    const start = this.parseDateOnly(startDate, false);
    const end = this.parseDateOnly(endDate, false);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
  }

  private formatDateKey(value: Date): string {
    return new Date(value).toISOString().slice(0, 10);
  }

  private toNumber(value: unknown): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }
}
