import { Page } from '@playwright/test';

export function createNavbarActions(page: Page) {
  const navigation = page.getByRole('navigation');

  /** Após o login, o link "Sign in" dá lugar a um botão com o nome completo do usuário. */
  function userMenu(fullName: string) {
    return navigation.getByRole('button', { name: fullName });
  }

  return {
    signInLink: navigation.getByRole('link', { name: 'Sign in' }),
    userMenu,

    /** "Sign out" não é exposto como link nem botão na árvore de acessibilidade. */
    async signOut(fullName: string) {
      await userMenu(fullName).click();
      await navigation.getByText('Sign out').click();
    },
  };
}
