/**
 * Pricing Service Unit Tests
 */

const { calculateDynamicPrice, getTimeMultiplier } = require('../../src/services/pricing.service');

describe('Pricing Service', () => {
  describe('calculateDynamicPrice', () => {
    it('should calculate price with time multiplier', () => {
      const basePrice = 100000;
      const costPrice = 50000;
      const factors = { timeMultiplier: 1.1 };
      
      const newPrice = calculateDynamicPrice(basePrice, costPrice, factors);
      
      expect(newPrice).toBe(110000);
    });

    it('should not go below cost price', () => {
      const basePrice = 100000;
      const costPrice = 80000;
      const factors = { timeMultiplier: 0.5 }; // 50% discount
      
      const newPrice = calculateDynamicPrice(basePrice, costPrice, factors);
      
      expect(newPrice).toBeGreaterThanOrEqual(costPrice);
    });

    it('should apply multiple multipliers', () => {
      const basePrice = 100000;
      const costPrice = 50000;
      const factors = {
        timeMultiplier: 1.1,
        demandMultiplier: 1.05,
        inventoryMultiplier: 0.95,
      };
      
      const newPrice = calculateDynamicPrice(basePrice, costPrice, factors);
      const expected = Math.round((100000 * 1.1 * 1.05 * 0.95) / 1000) * 1000;
      
      expect(newPrice).toBe(expected);
    });
  });

  describe('getTimeMultiplier', () => {
    it('should return peak hour multiplier (11-13)', () => {
      // Mock Date to 12:00
      const originalDate = Date;
      global.Date = jest.fn(() => ({ getHours: () => 12 })) as any;
      
      const multiplier = getTimeMultiplier();
      expect(multiplier).toBe(1.1);
      
      global.Date = originalDate;
    });

    it('should return off-peak multiplier (14-17)', () => {
      const originalDate = Date;
      global.Date = jest.fn(() => ({ getHours: () => 15 })) as any;
      
      const multiplier = getTimeMultiplier();
      expect(multiplier).toBe(0.95);
      
      global.Date = originalDate;
    });
  });
});

