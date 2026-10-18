import type { AllureConfig } from 'allure';

export default {
  name: 'Automação Toolshop',
  output: './allure-report',
  /* Guarda o resultado de cada execução para montar o histórico e as tendências do relatório. */
  historyPath: './allure-history.jsonl',
  plugins: {
    awesome: {
      options: {
        reportLanguage: 'br',
      },
    },
  },
} satisfies AllureConfig;
