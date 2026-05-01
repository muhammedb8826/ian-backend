/// <reference types="jest" />

import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const createQueryBuilderMock = (orders: unknown[]) => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(orders),
    };

    return queryBuilder;
  };

  const createService = (orders: unknown[], fixedCosts: unknown[] = []) => {
    const queryBuilder = createQueryBuilderMock(orders);
    const orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const fixedCostRepository = {
      find: jest.fn().mockResolvedValue(fixedCosts),
    };

    return {
      service: new ReportsService(
        orderRepository as never,
        fixedCostRepository as never,
      ),
      queryBuilder,
    };
  };

  it('uses order financial totals instead of inflated item sales', async () => {
    const order = {
      id: 'order-1',
      series: 'ORD-001',
      orderDate: new Date('2026-04-10T00:00:00.000Z'),
      totalAmount: 100,
      tax: 15,
      grandTotal: 115,
      status: 'Delivered',
      orderSource: 'Walk-in',
      customer: { fullName: 'Acme' },
      salesPartner: null,
      commission: [],
      orderItems: [
        {
          quantity: 1,
          totalAmount: 100,
          unitPrice: 100,
          totalCost: 40,
          sales: 1000000,
          item: { name: 'Banner' },
          service: { name: 'Printing' },
          nonStockService: null,
        },
      ],
    };

    const { service } = createService([order]);

    const report = await service.getCompanyProfitReport({
      page: 1,
      limit: 20,
    });

    expect(report.summary.totalSales).toBe(100);
    expect(report.summary.totalTax).toBe(15);
    expect(report.summary.totalGrandTotal).toBe(115);
    expect(report.summary.grossProfit).toBe(60);
    expect(report.summary.contributionProfit).toBe(60);
    expect(report.orders[0].totalSales).toBe(100);
    expect(report.orders[0].grossProfit).toBe(60);
    expect(report.orders[0].contributionProfit).toBe(60);
    expect(report.orders[0].fixedCostAllocation).toBeUndefined();
    expect(report.orders[0].netProfitAfterFixedCost).toBeUndefined();
  });

  it('uses filtered item invoice totals when item filters are applied', async () => {
    const order = {
      id: 'order-2',
      series: 'ORD-002',
      orderDate: new Date('2026-04-11T00:00:00.000Z'),
      totalAmount: 100,
      tax: 15,
      grandTotal: 115,
      status: 'Delivered',
      orderSource: 'Walk-in',
      customer: { fullName: 'Acme' },
      salesPartner: null,
      commission: [],
      orderItems: [
        {
          quantity: 1,
          totalAmount: 30,
          unitPrice: 30,
          totalCost: 10,
          sales: 300000,
          item: { name: 'Banner' },
          service: { name: 'Printing' },
          nonStockService: null,
        },
        {
          quantity: 1,
          totalAmount: 70,
          unitPrice: 70,
          totalCost: 20,
          sales: 700000,
          item: { name: 'Sticker' },
          service: { name: 'Cutting' },
          nonStockService: null,
        },
      ],
    };

    const { service } = createService([order]);

    const report = await service.getCompanyProfitReport({
      page: 1,
      limit: 20,
      items: ['Banner'],
    });

    expect(report.summary.totalSales).toBe(30);
    expect(report.summary.totalTax).toBeCloseTo(4.5);
    expect(report.summary.totalGrandTotal).toBeCloseTo(34.5);
    expect(report.summary.grossProfit).toBe(20);
    expect(report.summary.contributionProfit).toBe(20);
    expect(report.orders[0].totalSales).toBe(30);
    expect(report.orders[0].grossProfit).toBe(20);
    expect(report.orders[0].contributionProfit).toBe(20);
  });

  it('recalculates constant item cost from pricing dimensions for reporting', async () => {
    const order = {
      id: 'order-constant-cost',
      series: 'ORD-004',
      orderDate: new Date('2026-05-01T00:00:00.000Z'),
      totalAmount: 200,
      tax: 30,
      grandTotal: 230,
      status: 'Delivered',
      orderSource: 'telegram',
      customer: { fullName: 'Muhammed Berisso' },
      salesPartner: null,
      commission: [],
      orderItems: [
        {
          quantity: 1,
          totalAmount: 200,
          unitPrice: 200,
          unit: 10000,
          totalCost: 750000,
          sales: 200,
          item: { name: 'Banner 2M' },
          service: null,
          nonStockService: { name: 'PRINT ONLY' },
          pricing: {
            costPrice: 75,
            width: 100,
            height: 100,
          },
        },
      ],
    };

    const { service } = createService([order]);

    const report = await service.getCompanyProfitReport({
      page: 1,
      limit: 20,
      items: ['Banner 2M'],
    });

    expect(report.summary.totalCost).toBe(75);
    expect(report.summary.grossProfit).toBe(125);
    expect(report.summary.contributionProfit).toBe(125);
    expect(report.orders[0].totalCost).toBe(75);
  });

  it('only includes fixed cost allocation when explicitly requested', async () => {
    const order = {
      id: 'order-3',
      series: 'ORD-003',
      orderDate: new Date('2026-04-12T00:00:00.000Z'),
      totalAmount: 200,
      tax: 30,
      grandTotal: 230,
      status: 'Delivered',
      orderSource: 'Walk-in',
      customer: { fullName: 'Acme' },
      salesPartner: null,
      commission: [],
      orderItems: [
        {
          quantity: 1,
          totalAmount: 200,
          unitPrice: 200,
          totalCost: 120,
          sales: 999999,
          item: { name: 'Poster' },
          service: { name: 'Printing' },
          nonStockService: null,
        },
      ],
    };

    const fixedCosts = [
      {
        id: 'fixed-1',
        description: 'Rent',
        monthlyFixedCost: 0,
        dailyFixedCost: 50,
      },
    ];

    const { service } = createService([order], fixedCosts);

    const defaultReport = await service.getCompanyProfitReport({
      page: 1,
      limit: 20,
    });

    expect(defaultReport.orders[0].fixedCostAllocation).toBeUndefined();
    expect(defaultReport.orders[0].netProfitAfterFixedCost).toBeUndefined();
    expect(defaultReport.summary.companyNetProfitLoss).toBe(30);

    const allocatedReport = await service.getCompanyProfitReport({
      page: 1,
      limit: 20,
      includeFixedCostAllocation: 'true',
    });

    expect(allocatedReport.orders[0].fixedCostAllocation).toBe(50);
    expect(allocatedReport.orders[0].netProfitAfterFixedCost).toBe(30);
  });
});
