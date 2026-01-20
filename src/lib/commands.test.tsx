import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getCommandOutput } from './commands';

const renderOutput = async (command: string) => {
  const output = await getCommandOutput(command);
  if (!output) return '';
  if (typeof output === 'string') return output;
  return renderToStaticMarkup(React.createElement(React.Fragment, null, output));
};

describe('getCommandOutput', () => {
  it('renders help content', async () => {
    const output = await renderOutput('help');
    expect(output).toContain('Show this help message');
  });

  it('renders skills list', async () => {
    const output = await renderOutput('skills');
    expect(output).toMatch(/CI\/CD\s*&(?:amp;)?\s*Automation/);
  });

  it('renders skill details', async () => {
    const output = await renderOutput('skill AWS');
    expect(output).toContain('AWS');
    expect(output).toContain('Advanced');
  });

  it('handles missing skill', async () => {
    const output = await renderOutput('skill UnknownSkill');
    expect(output).toContain('Skill not found: UnknownSkill');
  });

  it('renders project details', async () => {
    const output = await renderOutput('project auto-scaler-cloud');
    expect(output).toContain('Auto-Scaling Cloud Infrastructure');
  });

  it('handles missing project', async () => {
    const output = await renderOutput('project unknown');
    expect(output).toContain('Project not found: unknown');
  });

  it('renders contact info', async () => {
    const output = await renderOutput('contact');
    expect(output).toContain('hello@devterminal.dev');
  });

  it('validates ask command formatting', async () => {
    const output = await renderOutput('ask hello');
    expect(output).toContain('Please enclose your question in double quotes.');
  });

  it('handles unknown commands', async () => {
    const output = await renderOutput('sdf');
    expect(output).toContain('Command not found: sdf');
  });

  it('returns empty output for clear', async () => {
    const output = await renderOutput('clear');
    expect(output).toBe('');
  });
});
