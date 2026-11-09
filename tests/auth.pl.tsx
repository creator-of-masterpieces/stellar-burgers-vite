import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const user = { name: 'Тестовый пользователь', email: 'test@example.com' };
const session = {
  success: true,
  user,
  accessToken: 'Bearer test-access',
  refreshToken: 'test-refresh',
};
const bun = {
  _id: 'test-bun',
  name: 'Тестовая булка',
  type: 'bun',
  price: 100,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  image: '',
  image_large: '',
  image_mobile: '',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/ingredients', (route) =>
    route.fulfill({ json: { success: true, data: [bun] } })
  );
});

const fillLogin = async (page: Page): Promise<void> => {
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
};

for (const failure of [
  'missing refresh token',
  'rejected refresh token',
  'network error',
] as const) {
  test(`logout ends local session with ${failure}`, async ({ page, context }) => {
    await context.addCookies([
      { name: 'accessToken', value: session.accessToken, url: 'http://localhost:4000' },
    ]);
    await page.route('**/auth/user', (route) =>
      route.fulfill({ json: { success: true, user } })
    );
    let logoutRequests = 0;
    await page.route('**/auth/logout', async (route) => {
      logoutRequests++;
      if (failure === 'network error') {
        await route.abort('failed');
        return;
      }
      await route.fulfill({
        status: 403,
        json: { success: false, message: 'Token required' },
      });
    });

    await page.goto('/profile');
    await expect(page.locator('input[name="name"]')).toHaveValue(user.name);
    if (failure !== 'missing refresh token') {
      await page.evaluate(
        (token) => localStorage.setItem('refreshToken', token),
        session.refreshToken
      );
    }
    await page.getByRole('button', { name: 'Выход', exact: true }).click();
    await expect(page).toHaveURL('/login');
    expect(logoutRequests).toBe(failure === 'missing refresh token' ? 0 : 1);
    expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
    expect(
      (await context.cookies()).some((cookie) => cookie.name === 'accessToken')
    ).toBe(false);
    await expect(page.getByText('Token required', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: user.name, exact: true })).toHaveCount(
      0
    );
    await page.goto('/profile');
    await expect(page).toHaveURL('/login');
  });
}

for (const formName of ['register', 'login'] as const) {
  test(`${formName} blocks short passwords and accepts the six-character boundary`, async ({
    page,
  }) => {
    let requests = 0;
    await page.route(`**/auth/${formName}`, async (route) => {
      requests++;
      expect(route.request().postDataJSON()).toEqual({
        ...(formName === 'register' ? { name: user.name } : {}),
        email: user.email,
        password: '123456',
      });
      await route.fulfill({ json: session });
    });
    await page.goto(`/${formName}`);
    if (formName === 'register') {
      await page.locator('input[name="name"]').fill(user.name);
    }
    await page.locator('input[name="email"]').fill(user.email);
    const password = page.locator('input[name="password"]');
    const submit = page.getByRole('button', {
      name: formName === 'register' ? 'Зарегистрироваться' : 'Войти',
      exact: true,
    });

    for (const invalidPassword of ['', '123', '12345']) {
      await password.fill(invalidPassword);
      await password.blur();
      if (invalidPassword) {
        await expect(
          page.getByText('Пароль должен содержать не менее 6 символов', { exact: true })
        ).toBeVisible();
      }
      expect(
        await password.evaluate((input: HTMLInputElement) => input.checkValidity())
      ).toBe(false);
      await submit.click();
      await password.press('Enter');
      // Bypass browser validation to check the submit handler as well.
      await page.locator('form').dispatchEvent('submit');
      await expect(page).toHaveURL(`/${formName}`);
      expect(requests).toBe(0);
      expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
    }

    await password.fill('123456');
    await password.blur();
    await expect(
      page.getByText('Пароль должен содержать не менее 6 символов', { exact: true })
    ).toHaveCount(0);
    await submit.click();
    await expect(page).toHaveURL('/');
    expect(requests).toBe(1);
  });
}

test('registration saves session; profile updates, reloads and logs out', async ({
  page,
  context,
}) => {
  await page.route('**/auth/register', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ ...user, password: 'password123' });
    await route.fulfill({ json: session });
  });
  let currentUser = user;
  await page.route('**/auth/user', async (route) => {
    expect(route.request().headers().authorization).toBe(session.accessToken);
    if (route.request().method() === 'PATCH') {
      expect(route.request().postDataJSON()).toEqual({ ...user, name: 'Новое имя' });
      currentUser = { ...user, name: 'Новое имя' };
    }
    await route.fulfill({ json: { success: true, user: currentUser } });
  });
  await page.route('**/auth/logout', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ token: session.refreshToken });
    await route.fulfill({ json: { success: true } });
  });

  await page.goto('/register');
  await page.locator('input[name="name"]').fill(user.name);
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: user.name, exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe(
    session.refreshToken
  );
  expect(
    (await context.cookies()).find((cookie) => cookie.name === 'accessToken')?.value
  ).toBe(encodeURIComponent(session.accessToken));

  await page.getByRole('link', { name: user.name, exact: true }).click();
  await expect(page.locator('input[name="email"]')).toHaveValue(user.email);
  await page.locator('input[name="name"]').fill('Новое имя');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Новое имя', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(
    0
  );
  await page.reload();
  await expect(page).toHaveURL('/profile');
  await expect(page.locator('input[name="name"]')).toHaveValue('Новое имя');

  await page.getByRole('button', { name: 'Выход', exact: true }).click();
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
  expect((await context.cookies()).some((cookie) => cookie.name === 'accessToken')).toBe(
    false
  );
});

test('login returns guest to protected page and guest routes redirect authenticated user', async ({
  page,
}) => {
  await page.route('**/auth/login', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: user.email,
      password: 'password123',
    });
    await route.fulfill({ json: session });
  });
  await page.route('**/auth/user', (route) =>
    route.fulfill({ json: { success: true, user } })
  );
  await page.goto('/profile');
  await expect(page).toHaveURL('/login');
  await fillLogin(page);
  await expect(page).toHaveURL('/profile');
  await expect(page.locator('input[name="name"]')).toHaveValue(user.name);
  await page.goto('/register');
  await expect(page).toHaveURL('/');
});

test('login error is visible; submit is blocked while request is pending', async ({
  page,
}) => {
  let finishRequest: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finishRequest = resolve;
  });
  let requests = 0;
  await page.route('**/auth/login', async (route) => {
    requests++;
    await pending;
    await route.fulfill({
      status: 401,
      json: { success: false, message: 'Неверный email или пароль' },
    });
  });
  await page.goto('/login');
  await fillLogin(page);
  await expect(page.getByRole('button', { name: 'Входим…' })).toBeDisabled();
  expect(requests).toBe(1);
  finishRequest?.();
  await expect(
    page.getByText('Неверный email или пароль', { exact: true })
  ).toBeVisible();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
  await page.getByRole('link', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page.getByText('Неверный email или пароль', { exact: true })).toHaveCount(
    0
  );
});

test('expired access token is refreshed and user request retries with new token', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'accessToken', value: 'Bearer expired', url: 'http://localhost:4000' },
  ]);
  await page.addInitScript(() => localStorage.setItem('refreshToken', 'old-refresh'));
  let userRequests = 0;
  let refreshRequests = 0;
  await page.route('**/auth/user', async (route) => {
    userRequests++;
    if (route.request().headers().authorization === 'Bearer expired') {
      await route.fulfill({
        status: 403,
        json: { success: false, message: 'jwt expired' },
      });
      return;
    }
    expect(route.request().headers().authorization).toBe(session.accessToken);
    await route.fulfill({ json: { success: true, user } });
  });
  await page.route('**/auth/token', async (route) => {
    refreshRequests++;
    expect(route.request().postDataJSON()).toEqual({ token: 'old-refresh' });
    await route.fulfill({ json: session });
  });
  await page.goto('/profile');
  await expect(page.locator('input[name="name"]')).toHaveValue(user.name);
  expect(userRequests).toBe(2);
  expect(refreshRequests).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe(
    session.refreshToken
  );
});

test('refresh token restores session without access cookie; invalid session clears tokens', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('refreshToken', 'saved-refresh'));
  await page.route('**/auth/token', (route) => route.fulfill({ json: session }));
  await page.route('**/auth/user', (route) =>
    route.fulfill({ json: { success: true, user } })
  );
  await page.goto('/profile');
  await expect(page.locator('input[name="name"]')).toHaveValue(user.name);

  await page.route('**/auth/user', (route) =>
    route.fulfill({ status: 403, json: { success: false, message: 'jwt expired' } })
  );
  await page.route('**/auth/token', (route) =>
    route.fulfill({ status: 403, json: { success: false, message: 'Token is invalid' } })
  );
  await page.reload();
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
  expect(
    (await page.context().cookies()).some((cookie) => cookie.name === 'accessToken')
  ).toBe(false);
});
