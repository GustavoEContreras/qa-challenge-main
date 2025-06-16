import {Page} from '@playwright/test';

export const getPageTitle = (page: Page) => page.getByRole('heading', { name: /Rooming List Management/i })
export const getSearchInput = (page: Page) => page.getByPlaceholder('Search');
export const getFiltersButton = (page: Page) => page.getByRole('button', { name: 'Filters' });
export const getSaveButton = (page: Page) => page.getByRole('button', { name: 'Save' });
export const getEventCards = (page: Page) => page.locator('.sc-bmCFzp');