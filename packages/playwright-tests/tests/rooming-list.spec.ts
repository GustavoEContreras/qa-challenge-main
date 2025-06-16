import { test, expect } from '@playwright/test';
import * as RoomingListSelectors from './rooming-list.selectors';
import * as RoomingListHelpers from './rooming-list.helpers';
import * as RoomingListAssertions from './rooming-list.assertions';

test.describe('Rooming List Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rooming-list-management');
  });

test('TC01 - Verify that the Search input is displayed', async ({ page }) => {
  const searchInput = RoomingListSelectors.getSearchInput(page);
  await expect(searchInput).toBeVisible();
});

test('TC02 - Verify that a user can type text into the Search input', async ({ page }) => {
  const searchInput = RoomingListSelectors.getSearchInput(page);
  await expect(searchInput).toBeEditable();
});

test('TC03 - Verify that searching filters the list of events based on input', async ({ page }) => {
  const searchInput = RoomingListSelectors.getSearchInput(page);
  await searchInput.fill('ACL');
  await searchInput.press('Enter');
});

test('TC04 - Verify that if no matching event is found, a \'no results\' message appears', async ({ page }) => {
  const searchInput = RoomingListSelectors.getSearchInput(page);
  await searchInput.fill("asdasd");
  await searchInput.press('Enter');

  const noResultsMessageh3 = page.getByText('No rooming lists found');
  await expect(noResultsMessageh3).toBeVisible();
});

test('TC05 - Verify that the Filters button is displayed', async ({ page }) => {
  const filtersButton = RoomingListSelectors.getFiltersButton(page);
  await expect(filtersButton).toBeVisible();
});

test('TC06 - Verify that clicking the Filters button opens the filter dropdown', async ({ page }) => {
  const filtersButton = RoomingListSelectors.getFiltersButton(page);
  await filtersButton.click();
  
  const rfpStatusDiv = page.getByText('RFP status');
  await expect(rfpStatusDiv).toBeVisible();
});

test('TC07 - Verify that the filter options are \'Active\', \'Closed\', and \'Canceled\'', async ({ page }) => {
  const filtersButton = RoomingListSelectors.getFiltersButton(page);
  await filtersButton.click();

  const allOptions = await page.locator('div.sc-ejXKMB').allTextContents();
  expect(allOptions).toEqual(expect.arrayContaining(['Active', 'Closed', 'Cancelled']));
});

test('TC08 - Verify that selecting a filter option filters the event list correctly', async ({ page }) => {
  await RoomingListHelpers.applyFilters(page, ['Active']);
  await RoomingListAssertions.expectAllStatusesToBe(page, ['Active']);
});

test('TC09 - Verify that the \'Save\' button applies the selected filter', async ({ page }) => {
  await RoomingListHelpers.applyFilters(page, ['Active']);

  await RoomingListAssertions.expectAllStatusesToBe(page, ['Active']);
});

test('TC10 - Verify that after applying a filter, the selected filter persists if the Filters dropdown is reopened', async ({ page }) => {
  await RoomingListHelpers.applyFilters(page, ['Active']);

  // Reopen dropdown to verify filter persistence
  const filterButton = RoomingListSelectors.getFiltersButton(page);
  await filterButton.click();

  const options = ['Active', 'Closed', 'Cancelled'];
  for (const label of options) {
    const optionText = page.locator('div.sc-ejXKMB', { hasText: label });
    const optionContainer = optionText.locator('..');
    const svg = optionContainer.locator('svg');
    const isSelected = (await svg.count()) > 0;

    if (label === 'Active') {
      expect(isSelected).toBe(true);
    } else {
      expect(isSelected).toBe(false);
    }
  }
  // Test will fail since the selected filter wont persist after Filters dropdown is reopened.
});


test('TC11 - Verify that multiple filters can be selected/deselected', async ({ page }) => {
  await RoomingListHelpers.applyFilters(page, ['Active', 'Closed']);

  await RoomingListAssertions.expectAllStatusesToBe(page, ['Active', 'Closed']);

  await RoomingListHelpers.applyFilters(page, ['Active']);

  await RoomingListAssertions.expectAllStatusesToBe(page, ['Active']);
});

test('TC12 - Verify that event cards are displayed grouped by event names', async ({ page }) => {
  const eventGroups = page.locator('div.sc-kiZvlW.etBHAC');
  const count = await eventGroups.count();

  expect(count).toBeGreaterThan(1);

  for (let i = 0; i < count; i++) {
    const group = eventGroups.nth(i);
    
    const eventName = await group.locator('div.sc-fOFsAX.kHRNIv > span').innerText();

    const eventCards = group.locator('div.sc-bmCFzp.kQijna');
    const cardsCount = await eventCards.count();

    expect(cardsCount).toBeGreaterThan(0);

    for (let j = 0; j < cardsCount; j++) {
      const card = eventCards.nth(j);
      
      const cardTitle = await card.locator('div.sc-lpbaSe.guyUPL').innerText();

      const groupText = await group.innerText();
      expect(groupText).toContain(eventName);
    }
  }
});

test('TC13 - Verify that each event card displays the RFP name, Agreement type, and Cut-Off Date', async ({ page }) => {
  const eventCards = page.locator('.sc-bmCFzp');

  const count = await eventCards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = eventCards.nth(i);

    const rfpName = card.locator('.sc-lpbaSe');
    await expect(rfpName).toHaveCount(1);
    await expect(rfpName).not.toBeEmpty();

    const agreement = card.locator('.sc-bxjEGZ');
    await expect(agreement).toHaveText(/Agreement:\s*(Artist|Staff|Leisure)/);

    const cutOff = card.locator('.sc-kiMgGE');
    await expect(cutOff).toContainText('Cut-Off Date');
  }
});

test('TC14 - Verify that the "View Bookings" button is displayed on each event card', async ({ page }) => {
  const eventCards = page.locator('.sc-bmCFzp');
  const cardCount = await eventCards.count();
  expect(cardCount).toBeGreaterThan(0);

  for (let i = 0; i < cardCount; i++) {
    const card = eventCards.nth(i);

    const viewBookingsBtn = card.locator('button:has-text("View Bookings")');
    await expect(viewBookingsBtn).toBeVisible();
  }
});

test('TC15 - Verify that the \'View Bookings\' button displays the correct number of bookings', async ({ page }) => {
  const eventCards = page.locator('.sc-bmCFzp');
  const cardCount = await eventCards.count();
  expect(cardCount).toBeGreaterThan(0);

  const card = eventCards.nth(0);
  const viewBookingsBtn = card.locator('button:has-text("View Bookings")');
  const viewBookingsText = await viewBookingsBtn.textContent();
  const numberOfBookings = RoomingListHelpers.extractBookingCount(viewBookingsText);

  await viewBookingsBtn.click();

  const bookingCards = page.locator('.sc-hZARmv .sc-dKKIkQ');
  await expect(bookingCards).toHaveCount(numberOfBookings);

});

test('TC16 - Verify that clicking on the \'View Bookings\' button opens the correct booking details', async ({ page }) => {
  const eventCards = page.locator('.sc-bmCFzp');
  const cardCount = await eventCards.count();
  expect(cardCount).toBeGreaterThan(0);

  const eventCard = eventCards.nth(0);
  const viewBookingsBtn = eventCard.locator('button:has-text("View Bookings")');
  await viewBookingsBtn.click();

  const bookingsCards = page.locator('.sc-dKKIkQ dxQRDf');
  const bookingCount = await bookingsCards.count();
  for (let i = 0; i < bookingCount; i++) {
    const bookingCard = bookingsCards.nth(i);

    RoomingListAssertions.expectBookingCardContent(bookingCard, page);
  }
});

test('TC17 - Verify that event cards can be scrolled horizontally when clicking the scroll button', async ({ page }) => {
  const eventsGroup = page.locator('.sc-kiZvlW etBHAC');
  const eventsCount = await eventsGroup.count();

  for (let i = 0; i < eventsCount; i++) {
    const eventGroup = eventsGroup.nth(i);

    const scrollDiv = eventGroup.locator('.sc-cUiCeM PMdYg');
    const firstPositionScroll = await RoomingListHelpers.getLeftOffset(scrollDiv);
    
    // Scroll right
    const scrollRightButton = eventGroup.locator('div.sc-fMGxnE.eAcqnK > button');
    await scrollRightButton.click();

    const secondPositionScroll = await RoomingListHelpers.getLeftOffset(scrollDiv);
  
    // Back to scroll left
    const scrollLeftButton = eventGroup.locator('div.sc-fMGxnE gyFxQZ > button');
    await scrollLeftButton.click();

    const thirdPositionScroll = await RoomingListHelpers.getLeftOffset(scrollDiv);
    

    expect(secondPositionScroll).not.toBeCloseTo(firstPositionScroll, 2);
    expect(thirdPositionScroll).toBeCloseTo(firstPositionScroll, 2);
  }
  
});

test('TC18 - Verify that the page title \'Rooming List Management: Events\' is displayed', async ({ page }) => {
  const pageTitleHeading = RoomingListSelectors.getPageTitle(page);
  await expect(pageTitleHeading).toBeVisible();
});

test('TC19 - Verify that the filters dropdown is correctly positioned under the Filters button', async ({ page }) => {
  const filtersButton = RoomingListSelectors.getFiltersButton(page);
  await filtersButton.click();

  const dropdown = page.getByText('RFP statusActiveClosedCancelledSave');

  await expect(dropdown).toBeVisible();

  const buttonBox = await filtersButton.boundingBox();
  const dropdownBox = await dropdown.boundingBox();

  expect(buttonBox).not.toBeNull();
  expect(dropdownBox).not.toBeNull();

  if (buttonBox && dropdownBox) {
    expect(dropdownBox.y).toBeGreaterThanOrEqual(buttonBox.y + buttonBox.height);
  }
});


test('TC20 - Verify that each event group has a clear visual separator', async ({ page }) => {
  const groups = page.locator('.sc-kiZvlW.etBHAC');
  const groupCount = await groups.count();
  expect(groupCount).toBeGreaterThan(1);

  for (let i = 0; i < groupCount; i++) {
    const group = groups.nth(i);

    const separator = group.locator('.sc-fGdIVZ.cWMHMu');
    const title = separator.locator('.sc-fOFsAX');
    const lines = separator.locator('.sc-kghAKo');

    const events = group.locator('.sc-eZbeWy.hWBVDH');

    await expect(separator).toBeVisible();
    await expect(lines).toHaveCount(2);
    await expect(title).toBeVisible();
    await expect(events).toBeVisible();

    const separatorBox = await separator.boundingBox();
    const eventsBox = await events.boundingBox();

    expect(separatorBox && eventsBox).not.toBeNull();
    if (separatorBox && eventsBox) {
      expect(separatorBox.y).toBeLessThan(eventsBox.y);
    }
  }
});


test('TC21 - Verify the behavior when no events are available', async ({ page }) => {
  const groups = page.locator('.sc-kiZvlW.etBHAC');
  const filtersButton = RoomingListSelectors.getFiltersButton(page);
  const searchInput = RoomingListSelectors.getSearchInput(page);
  await searchInput.fill("asdasd");
  await searchInput.press('Enter');

  const noResultsMessageh3 = page.getByText('No rooming lists found');
  
  await expect(noResultsMessageh3).toBeVisible();
  await expect(searchInput).toHaveCount(0);
  await expect(filtersButton).toHaveCount(0);
  await expect(groups).toHaveCount(0);
});

test('TC22 - Verify if search and filters work together', async ({ page }) => {
  await RoomingListHelpers.applyFilters(page, ['Closed']);

  const searchInput = RoomingListSelectors.getSearchInput(page);
  await searchInput.fill('Ultra');
  await searchInput.press('Enter');

  const eventCards = page.locator('.sc-bmCFzp');
  const cardCount = await eventCards.count();
  expect(cardCount).toBeGreaterThanOrEqual(1);

  const card = eventCards.nth(0);

  const rfpName = card.locator('.sc-lpbaSe');
  await expect(rfpName).toHaveCount(1);
  await expect(rfpName).toHaveText(/Ultra Artist Management/);

  const agreement = card.locator('.sc-bxjEGZ');
  await expect(agreement).toHaveText(/Artist/);

  const statusClosed = card.getByText('Closed').first();
  await expect(statusClosed).toContainText('Closed');
});

test('TC23 - Verify UI responsiveness on resize', async ({ page }) => {
  const viewports = [
  // Mobile
  { width: 320, height: 568 },   // iPhone SE
  { width: 375, height: 667 },   // iPhone 8
  { width: 393, height: 851 },   // Pixel 5
  { width: 412, height: 915 },   // Galaxy S20 Ultra
  { width: 430, height: 932 },   // iPhone 14 Pro

  // 💊 Tablets
  { width: 540, height: 720 },   // Surface Duo
  { width: 768, height: 1024 },  // iPad Mini
  { width: 834, height: 1194 },  // iPad Pro 11”

  // 💻 Laptops
  { width: 1280, height: 800 },  // Chromebook
  { width: 1366, height: 768 },  // Laptop
  { width: 1440, height: 900 },  // MacBook Air

  // 🖥️ Escritorios grandes
  { width: 1920, height: 1080 }, // Full HD
  { width: 2560, height: 1080 }, // UltraWide
  { width: 2560, height: 1440 }, // QHD
  { width: 3840, height: 2160 }, // 4K UHD
];

  const searchInput = RoomingListSelectors.getSearchInput(page);
  const filtersButton = RoomingListSelectors.getFiltersButton(page);
  const pageTitleHeading = RoomingListSelectors.getPageTitle(page);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    await expect(searchInput).toBeVisible();
    await expect(filtersButton).toBeVisible();
    await expect(pageTitleHeading).toBeVisible();
  }
});
});