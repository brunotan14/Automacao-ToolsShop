import { buildUser } from '../../support/factories/userFactory';
import { expect, test } from '../../support/fixtures';

test.describe('Cadastro', () => {
  test.beforeEach(async ({ app }) => {
    await app.register.open();
  });

  test('CT11 - deve cadastrar um novo cliente com dados válidos', async ({ app, page }) => {
    const newUser = buildUser();

    await app.register.fillForm(newUser);
    await app.register.submit();

    await expect(page).toHaveURL('/auth/login');
    await app.login.signIn(newUser.email, newUser.password);
    await app.account.expectLoggedIn(`${newUser.firstName} ${newUser.lastName}`);
  });

  test('CT12 - deve exigir todos os campos obrigatórios', async ({ app, page }) => {
    await app.register.submit();

    await expect(app.register.errors.firstName).toHaveText('First name is required');
    await expect(app.register.errors.lastName).toHaveText('Last name is required');
    await expect(app.register.errors.dob).toContainText('Date of Birth is required');
    await expect(app.register.errors.country).toHaveText('Country is required');
    await expect(app.register.errors.postalCode).toHaveText('Postcode is required');
    await expect(app.register.errors.houseNumber).toHaveText('House number is required');
    await expect(app.register.errors.street).toHaveText('Street is required');
    await expect(app.register.errors.city).toHaveText('City is required');
    await expect(app.register.errors.state).toHaveText('State is required');
    await expect(app.register.errors.phone).toHaveText('Phone is required.');
    await expect(app.register.errors.email).toHaveText('Email is required');
    await expect(app.register.errors.password).toContainText('Password is required');
    await expect(page).toHaveURL('/auth/register');
  });

  test('CT13 - deve recusar email já cadastrado', async ({ app, user }) => {
    await app.register.fillForm(user);
    await app.register.submit();

    await expect(app.register.errors.form).toHaveText(
      'A customer with this email address already exists.',
    );
  });

  test('CT14 - deve recusar cliente menor de 18 anos', async ({ app, page }) => {
    const minor = buildUser({ dob: `${new Date().getFullYear() - 10}-01-01` });

    await app.register.fillForm(minor);
    await app.register.submit();

    await expect(app.register.errors.form).toHaveText('Customer must be 18 years old.');
    await expect(page).toHaveURL('/auth/register');
  });

  test('CT15 - deve recusar telefone com letras', async ({ app }) => {
    await app.register.fillForm(buildUser({ phone: 'abc' }));
    await app.register.submit();

    await expect(app.register.errors.phone).toHaveText('Only numbers are allowed.');
  });

  test('CT16 - deve recusar email em formato inválido', async ({ app }) => {
    await app.register.fillForm(buildUser({ email: 'email-invalido' }));
    await app.register.submit();

    await expect(app.register.errors.email).toHaveText('Email format is invalid');
  });

  test('CT17 - deve recusar senha sem os requisitos de complexidade', async ({ app, page }) => {
    await app.register.fillForm(buildUser({ password: 'abcdefgh' }));
    await app.register.submit();

    await expect(app.register.errors.password).toBeVisible();
    await expect(page).toHaveURL('/auth/register');
  });

  test('CT18 - deve marcar os requisitos atendidos pela senha', async ({ app }) => {
    await app.register.typePassword(buildUser().password);

    await expect(app.register.passwordRequirement('Be at least 8 characters long')).toHaveClass(
      /text-success/,
    );
    await expect(
      app.register.passwordRequirement('Contain both uppercase and lowercase letters'),
    ).toHaveClass(/text-success/);
    await expect(app.register.passwordRequirement('Include at least one number')).toHaveClass(
      /text-success/,
    );
    await expect(app.register.passwordRequirement('Have at least one special symbol')).toHaveClass(
      /text-success/,
    );
  });
});
