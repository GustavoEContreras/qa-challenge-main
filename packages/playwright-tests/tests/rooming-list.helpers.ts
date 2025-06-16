import {Locator, Page} from '@playwright/test';

const shouldToggle = (label: string, isSelected: boolean, selected: string[]) =>
  selected.includes(label) !== isSelected;

export async function applyFilters(page: Page, selected: string[]) {
  const options = ['Active', 'Closed', 'Cancelled'];
  const filtersButton = page.getByRole('button', { name: 'Filters' });
  await filtersButton.click();

  for (const label of options) {
    const optionText = page.locator('div.sc-ejXKMB', { hasText: label });
    const optionContainer = optionText.locator('..');
    const svg = optionContainer.locator('svg');
    const isSelected = (await svg.count()) > 0;

    if (shouldToggle(label, isSelected, selected)) {
        await optionContainer.waitFor({ state: 'visible' });
        await optionContainer.click();
    }
  }

  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.click();
}

export function getScrollButton(group: Locator, direction: 'left' | 'right') {
  const className = direction === 'right' ? 'div.sc-fMGxnE.eAcqnK' : 'div.sc-fMGxnE.gyFxQZ';
  return group.locator(`${className} > button`);
}

function extractLeftOffset(style: string | null): number {
  const match = style?.match(/left:\s*([-\d.]+)px/);
  return match ? parseFloat(match[1]) : 0;
}

export async function getLeftOffset(locator: Locator): Promise<number> {
  const style = await locator.getAttribute('style');
  return extractLeftOffset(style);
}

export function extractBookingCount(label: string | null): number {
  const match = label?.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}

