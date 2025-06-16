import { Locator, Page, expect } from '@playwright/test';

export async function expectBookingCardContent(bookingCard: Locator, page: Page) {
  await expect(bookingCard.locator('.sc-gAqISa.clEiRj')).not.toBeEmpty();
  await expect(page.locator('div.sc-fpEFIB.gzoLBd > div:nth-child(2)')).toHaveText(/^ID: /);
  await expectStandardBookingLabels(bookingCard);
}

export async function expectStandardBookingLabels(card: Locator) {
  await expect(card.getByText(/^Phone:/)).toBeVisible();
  await expect(card.getByText(/^Hotel ID:/)).toBeVisible();
  await expect(card.getByText(/^Check-in:/)).toBeVisible();
  await expect(card.getByText(/^Check-out:/)).toBeVisible();
}

export async function expectAllStatusesToBe(page: Page, expected: string[] | string) {
  const validValues = Array.isArray(expected) ? expected : [expected];
  const statusElements = await page.$$('[status]');

  for (const element of statusElements) {
    const status = await element.getAttribute('status');
    expect(validValues).toContain(status);
  }
}