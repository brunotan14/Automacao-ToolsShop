import { buildUser } from '../../support/factories/userFactory';
import { expect, test } from '../../support/fixtures';

test.describe('Login', () => {
  test.beforeEach(async ({ app }) => {
    await app.login.open();
  });

  test('CT01 - deve autenticar com credenciais válidas', async ({ app, user }) => {
    await app.login.signIn(user.email, user.password);

    await app.account.expectLoggedIn(`${user.firstName} ${user.lastName}`);
  });

  test('CT02 - deve exigir email e senha', async ({ app, page }) => {
    await app.login.submit();

    await expect(app.login.emailError).toHaveText('Email is required');
    await expect(app.login.passwordError).toHaveText('Password is required');
    await expect(page).toHaveURL('/auth/login');
  });

  test('CT03 - deve rejeitar email em formato inválido', async ({ app }) => {
    await app.login.fillCredentials('emailinvalido', buildUser().password);
    await app.login.submit();

    await expect(app.login.emailError).toHaveText('Email format is invalid');
  });

  test('CT04 - deve rejeitar senha muito curta', async ({ app }) => {
    await app.login.fillCredentials(buildUser().email, 'ab');
    await app.login.submit();

    await expect(app.login.passwordError).toHaveText('Password length is invalid');
  });

  test('CT05 - deve recusar credenciais inexistentes', async ({ app }) => {
    const unregistered = buildUser();

    await app.login.signIn(unregistered.email, unregistered.password);

    await app.login.expectInvalidCredentials();
  });

  test('CT06 - deve bloquear a conta após 3 tentativas falhas', async ({ app, user }) => {
    await app.login.failSignIn(user.email, 3);
    await app.login.signIn(user.email, buildUser().password);

    await app.login.expectAccountLocked();
  });

  test('CT07 - conta bloqueada deve recusar a senha correta', async ({ app, user }) => {
    await app.login.failSignIn(user.email, 3);
    await app.login.signIn(user.email, user.password);

    await app.login.expectAccountLocked();
  });

  test('CT08 - deve encerrar a sessão no logout', async ({ app, page, user }) => {
    const fullName = `${user.firstName} ${user.lastName}`;

    await app.login.signIn(user.email, user.password);
    await app.account.expectLoggedIn(fullName);

    await app.navbar.signOut(fullName);

    await expect(page).toHaveURL('/auth/login');
    await expect(app.navbar.signInLink).toBeVisible();
    await expect(app.navbar.userMenu(fullName)).toBeHidden();
  });

  test('CT10 - deve navegar do login para o cadastro', async ({ app, page }) => {
    await app.login.goToRegister();

    await expect(page).toHaveURL('/auth/register');
    await expect(app.register.heading).toBeVisible();
  });
});

test.describe('Área logada sem sessão', () => {
  test('CT09 - deve redirecionar para o login ao acessar área logada sem sessão', async ({
    app,
    page,
  }) => {
    await app.account.open();

    await expect(page).toHaveURL('/auth/login');
    await expect(app.login.heading).toBeVisible();
  });
});
