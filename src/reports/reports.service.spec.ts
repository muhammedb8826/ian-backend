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

  const createService = (orders: unknown[]) => {
    const queryBuilder = createQueryBuilderMock(orders);
    const orderRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const fixedCostRepository = {
      find: jest.fn().mockResolvedValue([]),
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
    expect(report.orders[0].totalSales).toBe(100);
    expect(report.orders[0].grossProfit).toBe(60);
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
    expect(report.orders[0].totalSales).toBe(30);
    expect(report.orders[0].grossProfit).toBe(20);
  });
});
