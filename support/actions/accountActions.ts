import { Page, expect, test } from '@playwright/test';

export function createAccountActions(page: Page) {
  const title = page.getByRole('heading', { name: 'My account', level: 1 });

  return {
    title,

    /** Sem checkpoint: a rota é protegida e pode redirecionar para o login. */
    async open() {
      await page.goto('/account');
    },

    /** Estado logado: área da conta aberta e o menu do usuário no lugar do link "Sign in". */
    async expectLoggedIn(fullName: string) {
      await test.step(
        `Validar usuário "${fullName}" logado`,
        async () => {
          const navigation = page.getByRole('navigation');
          await expect(page).toHaveURL('/account');
          await expect(title).toBeVisible();
          await expect(navigation.getByRole('button', { name: fullName })).toBeVisible();
          await expect(navigation.getByRole('link', { name: 'Sign in' })).toBeHidden();
        },
        { box: true },
      );
    },
  };
}
