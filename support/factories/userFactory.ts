import { faker } from '@faker-js/faker';

export type User = {
  firstName: string;
  lastName: string;
  /** Formato YYYY-MM-DD, exigido pelo formulário e pela API. */
  dob: string;
  /** `code` é enviado à API; `name` é o texto da opção no select da UI. */
  country: { code: string; name: string };
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  password: string;
};

/** Garante os 4 requisitos do Toolshop: 8+ caracteres, maiúscula e minúscula, número e símbolo. */
function buildPassword(): string {
  const upper = faker.string.alpha({ length: 1, casing: 'upper' });
  const lower = faker.string.alpha({ length: 6, casing: 'lower' });
  const digits = faker.string.numeric(2);
  return `${upper}${lower}${digits}@`;
}

/** Email único por chamada: o Toolshop é um ambiente público e compartilhado. */
function buildEmail(): string {
  const suffix = faker.string.alphanumeric({ length: 6, casing: 'lower' });
  return `qa.auto.${Date.now()}.${suffix}@example.com`;
}

/** Usuário válido para cadastro. Use `overrides` para montar cenários negativos. */
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dob: faker.date.birthdate({ mode: 'age', min: 18, max: 80 }).toISOString().slice(0, 10),
    country: { code: 'BR', name: 'Brazil' },
    postalCode: faker.location.zipCode('#####-###'),
    houseNumber: faker.location.buildingNumber(),
    street: faker.location.street(),
    city: faker.location.city(),
    state: faker.location.state(),
    phone: faker.string.numeric(11),
    email: buildEmail(),
    password: buildPassword(),
    ...overrides,
  };
}
