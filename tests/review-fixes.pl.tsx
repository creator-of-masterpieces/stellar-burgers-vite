import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const user = { name: 'Проверка', email: 'review@example.com' };
const session = {
  success: true,
  user,
  accessToken: 'Bearer review',
  refreshToken: 'review-refresh',
};
const image = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const bun = {
  _id: 'bun-one',
  name: 'Первая булка',
  type: 'bun',
  price: 100,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  image,
  image_large: image,
  image_mobile: image,
};
const otherBun = { ...bun, _id: 'bun-two', name: 'Вторая булка' };
const filling = { ...bun, _id: 'filling', name: 'Начинка', type: 'main' };
const order = {
  _id: 'order',
  number: 201,
  name: 'Обновляемый заказ',
  status: 'pending',
  ingredients: [bun._id, filling._id, bun._id],
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
};
const authenticate = async (page: Page): Promise<void> => {
  await page
    .context()
    .addCookies([
      { name: 'accessToken', value: session.accessToken, url: 'http://localhost:4000' },
    ]);
  await page.route('**/auth/user', (route) =>
    route.fulfill({ json: { success: true, user } })
  );
};

test.beforeEach(async ({ page }) => {
  await page.route('**/ingredients', (route) =>
    route.fulfill({ json: { success: true, data: [bun, otherBun, filling] } })
  );
});

test('ingredient counters track additions, removal, bun replacement and successful order', async ({
  page,
}) => {
  await authenticate(page);
  await page.route(/\/api\/orders$/, (route) =>
    route.fulfill({ json: { success: true, order, name: order.name } })
  );
  await page.goto('/');
  const first = page.locator('a[href="/ingredients/bun-one"]').locator('..');
  const second = page.locator('a[href="/ingredients/bun-two"]').locator('..');
  const main = page.locator('a[href="/ingredients/filling"]').locator('..');
  await first.getByRole('button', { name: 'Добавить' }).click();
  await main.getByRole('button', { name: 'Добавить' }).click();
  await main.getByRole('button', { name: 'Добавить' }).click();
  await expect(first.locator('.counter__num')).toHaveText('2');
  await expect(main.locator('.counter__num')).toHaveText('2');
  await page
    .getByTestId('constructor-ingredients')
    .locator('.constructor-element__action')
    .first()
    .click();
  await expect(main.locator('.counter__num')).toHaveText('1');
  await second.getByRole('button', { name: 'Добавить' }).click();
  await expect(first.locator('.counter__num')).toHaveCount(0);
  await expect(second.locator('.counter__num')).toHaveText('2');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.locator('#modals')).toContainText('201');
  await page.keyboard.press('Escape');
  await expect(page.locator('.counter__num')).toHaveCount(0);
});

test('constructor stays highlighted on ingredient modal and direct detail page; overlay blocks counter clicks', async ({
  page,
}) => {
  await page.goto('/');
  const card = page.locator('a[href="/ingredients/bun-one"]');
  await card.locator('..').getByRole('button', { name: 'Добавить' }).click();
  const header = page.getByRole('link', { name: 'Конструктор', exact: true });
  const activeClass = await header.getAttribute('class');
  const iconFill = await header.locator('svg').getAttribute('fill');
  await card.click();
  await expect(page).toHaveURL('/ingredients/bun-one');
  await expect(header).toHaveAttribute('class', activeClass!);
  await expect(header.locator('svg')).toHaveAttribute('fill', iconFill!);
  await expect(page.locator('#root')).toHaveAttribute('inert', '');
  const counter = await card.locator('.counter__num').boundingBox();
  expect(counter).not.toBeNull();
  const point = {
    x: counter!.x + counter!.width / 2,
    y: counter!.y + counter!.height / 2,
  };
  expect(
    await page.evaluate(
      ({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('#modals')),
      point
    )
  ).toBe(true);
  await page.mouse.click(point.x, point.y);
  await expect(page).toHaveURL('/');
  await expect(page.locator('#modals')).toBeEmpty();
  await expect(page.locator('#root')).not.toHaveAttribute('inert', '');
  await page.goto('/ingredients/bun-one');
  await expect(header).toHaveAttribute('class', activeClass!);
  await expect(header.locator('svg')).toHaveAttribute('fill', iconFill!);
});

test('registration preserves requested history URL including search and hash', async ({
  page,
}) => {
  await page.route('**/auth/register', (route) => route.fulfill({ json: session }));
  await page.route(/\/api\/orders$/, (route) =>
    route.fulfill({ json: { success: true, orders: [] } })
  );
  await page.goto('/profile/orders?source=registration#history');
  await expect(page).toHaveURL('/login');
  await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
  await page.locator('input[name="name"]').fill(user.name);
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page).toHaveURL('/profile/orders?source=registration#history');
  await expect(page.getByText('У вас пока нет заказов.', { exact: true })).toBeVisible();
});

test('history polls without hiding cards, updates an open cached order and stops on leaving', async ({
  page,
}) => {
  await authenticate(page);
  await page.clock.install();
  let requests = 0;
  let detailRequests = 0;
  let releaseUpdate!: () => void;
  const update = new Promise<void>((resolve) => {
    releaseUpdate = resolve;
  });
  await page.route(/\/api\/orders$/, async (route) => {
    requests++;
    if (requests > 1) await update;
    await route.fulfill({
      json: {
        success: true,
        orders: [{ ...order, status: requests > 1 ? 'done' : 'pending' }],
      },
    });
  });
  await page.route(/\/api\/orders\/201$/, (route) => {
    detailRequests++;
    return route.fulfill({ json: { success: true, orders: [order] } });
  });
  await page.goto('/profile/orders');
  const card = page.locator('main a[href="/profile/orders/201"]');
  await expect(card).toContainText('Готовится');
  await card.click();
  await expect(page.locator('#modals')).toContainText('Готовится');
  expect(detailRequests).toBe(0);
  await page.clock.fastForward(10_100);
  await expect.poll(() => requests).toBe(2);
  await expect(card).toHaveCount(1);
  await expect(page.getByRole('status')).toHaveCount(0);
  releaseUpdate();
  await expect(page.locator('#modals')).toContainText('Выполнен');
  await page.keyboard.press('Escape');
  await expect(card).toContainText('Выполнен');
  await page.getByRole('link', { name: 'Конструктор', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('constructor')).toBeVisible();
  const requestsAfterLeaving = requests;
  await page.clock.fastForward(30_000);
  expect(requests).toBe(requestsAfterLeaving);
});

test('temporary session-check failure preserves tokens and allows retry', async ({
  page,
}) => {
  await authenticate(page);
  await page.addInitScript(
    (token) => localStorage.setItem('refreshToken', token),
    session.refreshToken
  );
  let checks = 0;
  await page.route('**/auth/user', async (route) => {
    checks++;
    if (checks === 1) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({ json: { success: true, user } });
  });
  await page.goto('/profile');
  await expect(page.getByRole('alert')).toContainText(
    'Не удалось проверить авторизацию'
  );
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe(
    session.refreshToken
  );
  expect(
    (await page.context().cookies()).some(({ name }) => name === 'accessToken')
  ).toBe(true);
  await page.getByRole('button', { name: 'Повторить проверку' }).click();
  await expect(page.locator('input[name="name"]')).toHaveValue(user.name);
  await expect(page).toHaveURL('/profile');
});

test('password recovery retries failures, blocks duplicate requests and returns after resetting', async ({
  page,
}) => {
  let recoveries = 0;
  await page.route(/\/api\/password-reset$/, async (route) => {
    recoveries++;
    await route.fulfill(
      recoveries === 1
        ? { status: 500, json: { success: false, message: 'Попробуйте позже' } }
        : { json: { success: true } }
    );
  });
  let releaseReset!: () => void;
  const reset = new Promise<void>((resolve) => {
    releaseReset = resolve;
  });
  let resets = 0;
  await page.route(/\/api\/password-reset\/reset$/, async (route) => {
    resets++;
    expect(route.request().postDataJSON()).toEqual({
      password: '123456',
      token: 'code',
    });
    await reset;
    await route.fulfill({ json: { success: true } });
  });
  await page.goto('/forgot-password');
  await page.locator('input[name="email"]').fill(user.email);
  await page.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(page.getByText('Попробуйте позже', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(page).toHaveURL('/reset-password');
  await page.locator('input[name="password"]').fill('123456');
  await page.locator('input[name="token"]').fill('code');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Сохранить', exact: true })
  ).toBeDisabled();
  await page.locator('form').dispatchEvent('submit');
  expect(resets).toBe(1);
  releaseReset();
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => localStorage.getItem('resetPassword'))).toBeNull();
});
