import { test as base } from '@playwright/test';
import { createAccountActions } from './actions/accountActions';
import { createLoginActions } from './actions/loginActions';
import { createNavbarActions } from './actions/navbarActions';
import { createRegisterActions } from './actions/registerActions';
import { createUsersApi } from './api/usersApi';
import { buildUser, User } from './factories/userFactory';

type App = {
  login: ReturnType<typeof createLoginActions>;
  register: ReturnType<typeof createRegisterActions>;
  account: ReturnType<typeof createAccountActions>;
  navbar: ReturnType<typeof createNavbarActions>;
};

type Fixtures = {
  app: App;
  /** Usuário novo, já cadastrado via API: cada teste tem a sua própria conta. */
  user: User;
};

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    const app: App = {
      login: createLoginActions(page),
      register: createRegisterActions(page),
      account: createAccountActions(page),
      navbar: createNavbarActions(page),
    };
    await use(app);
  },

  user: async ({ request }, use) => {
    const user = buildUser();
    await createUsersApi(request).register(user);
    await use(user);
  },
});

export { expect } from '@playwright/test';
