import { describe, it, expect } from 'vitest';
import {
  getStates,
  getArticles,
  getEras,
  getPrecedents,
  getGovernors,
  getIncidents,
  getStateByCode,
  getArticleByNumber,
  getEraById,
  getPrecedentById,
  getStatesByUT,
  getIncidentCountByState,
  getIncidentCountByGovernor,
  getAverageSeverityByState,
} from '../data';

describe('data loader validation', () => {
  it('loads metadata collections correctly', () => {
    expect(getStates()).toHaveLength(36);
    expect(getArticles()).toHaveLength(5);
    expect(getEras()).toHaveLength(5);
    expect(getPrecedents()).toHaveLength(3);
    expect(getGovernors()).toHaveLength(0);
    expect(getIncidents()).toHaveLength(0);
  });

  describe('lookup functions', () => {
    it('finds states by code', () => {
      const maharashtra = getStateByCode('MH');
      expect(maharashtra).toBeDefined();
      expect(maharashtra?.name).toBe('Maharashtra');
      expect(maharashtra?.ut).toBe(false);

      const delhi = getStateByCode('DL');
      expect(delhi).toBeDefined();
      expect(delhi?.ut).toBe(true);
    });

    it('finds articles by number', () => {
      const article163 = getArticleByNumber(163);
      expect(article163).toBeDefined();
      expect(article163?.title).toBe('Council of Ministers to aid and advise Governor');
    });

    it('finds eras by id', () => {
      const emergency = getEraById('emergency');
      expect(emergency).toBeDefined();
      expect(emergency?.name).toBe('Emergency');
    });

    it('finds precedents by id', () => {
      const bommai = getPrecedentById('sr_bommai_1994');
      expect(bommai).toBeDefined();
      expect(bommai?.year).toBe(1994);
    });
  });

  describe('filtering functions', () => {
    it('filters states by UT status', () => {
      expect(getStatesByUT(false)).toHaveLength(28);
      expect(getStatesByUT(true)).toHaveLength(8);
    });
  });

  describe('aggregation functions (empty data)', () => {
    it('returns empty collections for empty seed data', () => {
      expect(getIncidentCountByState().size).toBe(0);
      expect(getIncidentCountByGovernor().size).toBe(0);
      expect(getAverageSeverityByState().size).toBe(0);
    });
  });
});
