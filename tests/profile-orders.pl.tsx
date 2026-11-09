import { expect, test } from '@playwright/test';

const user = { name: 'История', email: 'orders@example.com' };
const accessToken = 'Bearer orders-access';
const bun = {
  _id: 'orders-bun',
  name: 'Булка для истории',
  type: 'bun',
  price: 100,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  image: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
  image_large: '',
  image_mobile: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
};
const olderOrder = {
  _id: 'older-order',
  number: 101,
  name: 'Первый заказ',
  status: 'done',
  ingredients: [bun._id, bun._id],
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
};
const newerOrder = {
  ...olderOrder,
  _id: 'newer-order',
  number: 102,
  name: 'Второй заказ',
  status: 'pending',
  createdAt: '2026-11-02T12:00:00.000Z',
};

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    { name: 'accessToken', value: accessToken, url: 'http://localhost:4000' },
  ]);
  await page.route('**/ingredients', (route) =>
    route.fulfill({ json: { success: true, data: [bun] } })
  );
  await page.route('**/auth/user', (route) =>
    route.fulfill({ json: { success: true, user } })
  );
});

test('loads personal orders, sorts newest first and opens details over history', async ({
  page,
}) => {
  let finishRequest!: () => void;
  const pending = new Promise<void>((resolve) => {
    finishRequest = resolve;
  });
  let requests = 0;
  await page.route(/\/api\/orders$/, async (route) => {
    requests++;
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe(accessToken);
    await pending;
    await route.fulfill({
      json: { success: true, orders: [olderOrder, newerOrder] },
    });
  });
  await page.route(/\/api\/orders\/102$/, (route) =>
    route.fulfill({ json: { success: true, orders: [newerOrder] } })
  );

  await page.goto('/profile/orders');
  await expect(page.getByRole('status')).toHaveText('Загружаем историю заказов…');
  await expect(
    page.getByRole('link', { name: 'История заказов', exact: true })
  ).toBeVisible();
  expect(requests).toBe(1);
  finishRequest();

  const cards = page.locator('main a[href^="/profile/orders/"]');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('Второй заказ');
  await expect(cards.nth(1)).toContainText('Первый заказ');
  await expect(cards.nth(0)).toContainText('200');
  await expect(cards.nth(1)).toContainText('Выполнен');
  await cards.nth(0).click();
  await expect(page).toHaveURL('/profile/orders/102');
  await expect(page.locator('#modals')).toContainText('#000102');
  await expect(page.locator('#modals')).toContainText('Второй заказ');
  await expect(page.locator('#modals')).toContainText('Состав:');
  await expect(cards).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/profile/orders');
  await expect(page.locator('#modals')).toBeEmpty();
  expect(requests).toBe(1);

  await page.reload();
  await expect(cards).toHaveCount(2);
  expect(requests).toBe(2);
  await page.goto('/profile/orders/102');
  await expect(page.locator('#modals')).toBeEmpty();
  await expect(page.getByText('#000102', { exact: true })).toBeVisible();
  await expect(page.getByText('Состав:', { exact: true })).toBeVisible();
});

test('keeps menu available on failure and retries to an empty history', async ({
  page,
}) => {
  let requests = 0;
  await page.route(/\/api\/orders$/, async (route) => {
    requests++;
    if (requests === 1) {
      await route.fulfill({
        status: 500,
        json: { success: false, message: 'History unavailable' },
      });
      return;
    }
    await route.fulfill({ json: { success: true, orders: [] } });
  });
  await page.goto('/profile/orders');
  await expect(page.getByRole('alert')).toHaveText(
    'Не удалось загрузить историю заказов.'
  );
  await expect(page.getByRole('link', { name: 'Профиль', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Повторить загрузку' }).click();
  await expect(page.getByText('У вас пока нет заказов.', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(requests).toBe(2);
});

test('refreshes expired token while fetching personal orders', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('refreshToken', 'saved-refresh'));
  let requests = 0;
  await page.route(/\/api\/orders$/, async (route) => {
    requests++;
    if (route.request().headers().authorization === accessToken) {
      await route.fulfill({
        status: 403,
        json: { success: false, message: 'jwt expired' },
      });
      return;
    }
    expect(route.request().headers().authorization).toBe('Bearer refreshed-access');
    await route.fulfill({ json: { success: true, orders: [olderOrder] } });
  });
  await page.route('**/auth/token', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ token: 'saved-refresh' });
    await route.fulfill({
      json: {
        success: true,
        accessToken: 'Bearer refreshed-access',
        refreshToken: 'refreshed-refresh',
      },
    });
  });
  await page.goto('/profile/orders');
  await expect(page.getByRole('link', { name: /Первый заказ/ })).toBeVisible();
  expect(requests).toBe(2);
});

test('guest is redirected before history or private details load', async ({
  page,
  context,
}) => {
  await context.clearCookies();
  let requests = 0;
  await page.route(/\/api\/orders(?:\/.*)?$/, (route) => {
    requests++;
    return route.fulfill({ json: { success: true, orders: [olderOrder] } });
  });
  await page.goto('/profile/orders');
  await expect(page).toHaveURL('/login');
  await page.goto('/profile/orders/101');
  await expect(page).toHaveURL('/login');
  expect(requests).toBe(0);
});

test('late response from previous account cannot replace current user history', async ({
  page,
}) => {
  let finishOldRequest!: () => void;
  const pending = new Promise<void>((resolve) => {
    finishOldRequest = resolve;
  });
  await page.route(/\/api\/orders$/, async (route) => {
    if (route.request().headers().authorization === accessToken) {
      await pending;
      await route.fulfill({ json: { success: true, orders: [olderOrder] } });
      return;
    }
    await route.fulfill({ json: { success: true, orders: [] } });
  });
  await page.route('**/auth/logout', (route) =>
    route.fulfill({ json: { success: true } })
  );
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      json: {
        success: true,
        user: { name: 'Другой пользователь', email: 'other@example.com' },
        accessToken: 'Bearer other-access',
        refreshToken: 'other-refresh',
      },
    })
  );
  await page.goto('/profile/orders');
  await expect(page.getByRole('status')).toBeVisible();
  await page.getByRole('button', { name: 'Выход', exact: true }).click();
  await expect(page).toHaveURL('/login');
  await page.locator('input[name="email"]').fill('other@example.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL('/profile/orders');
  await expect(page.getByText('У вас пока нет заказов.', { exact: true })).toBeVisible();

  const oldResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/orders') &&
      response.request().headers().authorization === accessToken
  );
  finishOldRequest();
  await (await oldResponse).finished();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
  await expect(page.getByText('У вас пока нет заказов.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Первый заказ/ })).toHaveCount(0);
});
