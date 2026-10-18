import { APIRequestContext, expect } from '@playwright/test';
import { User } from '../factories/userFactory';

const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

export function createUsersApi(request: APIRequestContext) {
  return {
    /** Cadastra o usuário direto na API: prepara o estado dos testes sem passar pela UI. */
    async register(user: User) {
      const response = await request.post(`${API_URL}/users/register`, {
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          dob: user.dob,
          phone: user.phone,
          email: user.email,
          password: user.password,
          address: {
            street: user.street,
            house_number: user.houseNumber,
            city: user.city,
            state: user.state,
            country: user.country.code,
            postal_code: user.postalCode,
          },
        },
      });
      await expect(response).toBeOK();
    },
  };
}
