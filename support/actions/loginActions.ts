import { Page, expect, test } from '@playwright/test';

/** Nunca coincide com as senhas geradas pela factory (que terminam com "@"). */
const WRONG_PASSWORD = 'Wrong@Pass1';

export function createLoginActions(page: Page) {
  const heading = page.getByRole('heading', { name: 'Login' });
  const emailInput = page.getByRole('textbox', { name: 'Email address' });
  // getByLabel('Password') também casaria com o link "Forgot your Password?" (aria-label).
  const passwordInput = page.getByRole('textbox', { name: 'Password' });
  const submitButton = page.getByRole('button', { name: 'Login', exact: true });
  const registerLink = page.getByRole('link', { name: 'Register your account' });
  // As mensagens de erro não têm role nem label: o test id é o único localizador estável
  // que permite validar o texto exibido.
  const loginError = page.getByTestId('login-error');

  /** Preenche, envia e aguarda a resposta da API (sucesso, 401 ou 423). */
  async function signIn(email: string, password: string) {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    const loginResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/users/login') && response.request().method() === 'POST',
    );
    await submitButton.click();
    await loginResponse;
  }

  async function expectInvalidCredentials() {
    await test.step(
      'Validar credenciais recusadas',
      async () => {
        await expect(loginError).toHaveText('Invalid email or password');
        await expect(page).toHaveURL('/auth/login');
      },
      { box: true },
    );
  }

  return {
    heading,
    emailError: page.getByTestId('email-error'),
    passwordError: page.getByTestId('password-error'),
    loginError,
    signIn,
    expectInvalidCredentials,

    /** O formulário é carregado de forma assíncrona pelo Angular: aguarda o heading antes de seguir. */
    async open() {
      await page.goto('/auth/login');
      await expect(heading).toBeVisible();
    },

    async fillCredentials(email: string, password: string) {
      await emailInput.fill(email);
      await passwordInput.fill(password);
    },

    /** Clique simples: use para validações do formulário, que não chamam a API. */
    async submit() {
      await submitButton.click();
    },

    /** Erra a senha `attempts` vezes seguidas, validando a recusa de cada tentativa. */
    async failSignIn(email: string, attempts: number) {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        await signIn(email, WRONG_PASSWORD);
        await expectInvalidCredentials();
      }
    },

    async expectAccountLocked() {
      await test.step(
        'Validar conta bloqueada',
        async () => {
          await expect(loginError).toHaveText(
            'Account locked, too many failed attempts. Please contact the administrator.',
          );
          await expect(page).toHaveURL('/auth/login');
        },
        { box: true },
      );
    },

    async goToRegister() {
      await registerLink.click();
    },
  };
}
