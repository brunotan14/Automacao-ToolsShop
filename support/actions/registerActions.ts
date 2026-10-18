import { Page, expect } from '@playwright/test';
import { User } from '../factories/userFactory';

export function createRegisterActions(page: Page) {
  const heading = page.getByRole('heading', { name: 'Customer registration' });
  const passwordInput = page.getByLabel('Password');

  return {
    heading,
    // As mensagens de erro não têm role nem label: o test id é o único localizador estável
    // que permite validar o texto exibido.
    errors: {
      firstName: page.getByTestId('first-name-error'),
      lastName: page.getByTestId('last-name-error'),
      dob: page.getByTestId('dob-error'),
      country: page.getByTestId('country-error'),
      postalCode: page.getByTestId('postal_code-error'),
      houseNumber: page.getByTestId('house_number-error'),
      street: page.getByTestId('street-error'),
      city: page.getByTestId('city-error'),
      state: page.getByTestId('state-error'),
      phone: page.getByTestId('phone-error'),
      email: page.getByTestId('email-error'),
      password: page.getByTestId('password-error'),
      form: page.getByTestId('register-error'),
    },

    /** Item do checklist "Your password must:" exibido abaixo do campo de senha. */
    passwordRequirement(text: string) {
      return page.getByRole('listitem').filter({ hasText: text });
    },

    /** O formulário é carregado de forma assíncrona pelo Angular: aguarda o heading antes de seguir. */
    async open() {
      await page.goto('/auth/register');
      await expect(heading).toBeVisible();
    },

    async fillForm(user: User) {
      await page.getByLabel('First name').fill(user.firstName);
      await page.getByLabel('Last name').fill(user.lastName);
      await page.getByLabel('Date of Birth').fill(user.dob);
      await page
        .getByRole('combobox', { name: 'Country' })
        .selectOption({ label: user.country.name });
      await page.getByLabel('Postal code').fill(user.postalCode);
      await page.getByLabel('House number').fill(user.houseNumber);
      await page.getByLabel('Street').fill(user.street);
      await page.getByLabel('City').fill(user.city);
      await page.getByLabel('State').fill(user.state);
      await page.getByLabel('Phone').fill(user.phone);
      await page.getByLabel('Email address').fill(user.email);
      await passwordInput.fill(user.password);
    },

    /** O checklist de requisitos só é atualizado quando o campo de senha perde o foco. */
    async typePassword(password: string) {
      await passwordInput.fill(password);
      await passwordInput.blur();
    },

    async submit() {
      await page.getByRole('button', { name: 'Register' }).click();
    },
  };
}
