import { describe, expect, it } from 'vitest';

import { ABOUTME_TEXT, COMMANDS, getPortfolioSnapshot } from './data';

describe('portfolio data', () => {
  it('includes core terminal commands', () => {
    expect(COMMANDS).toEqual(expect.arrayContaining(['help', 'skills', 'contact']));
  });

  it('builds a complete portfolio snapshot', () => {
    const snapshot = getPortfolioSnapshot();

    expect(snapshot.aboutMe).toBe(ABOUTME_TEXT);
    expect(snapshot.skills.length).toBeGreaterThan(0);
    expect(snapshot.projects.length).toBeGreaterThan(0);
    expect(snapshot.experience.length).toBeGreaterThan(0);
    expect(snapshot.education.length).toBeGreaterThan(0);
    expect(snapshot.resume.headline).toBeTruthy();
    expect(snapshot.contact.length).toBeGreaterThan(0);

    snapshot.contact.forEach(item => {
      expect(item.name).toBeTruthy();
      expect(item.value).toBeTruthy();
      expect(item.href).toMatch(/^(https?:|mailto:)/);
    });
  });
});
