// sequelize-cli reads this file directly (CommonJS, not part of the app's TS build).
// Keep these values in sync with src/db.ts.
function env(name, fallback) {
  return process.env[name] ?? fallback;
}

const base = {
  dialect: "postgres",
  host: env("DB_HOST", "localhost"),
  port: Number(env("DB_PORT", "5432")),
  username: env("DB_USER", "postgres"),
  password: env("DB_PASSWORD", ""),
};

module.exports = {
  development: {
    ...base,
    database: `${env("DB_NAME", "ledger_flow")}_development`,
  },
  test: {
    ...base,
    database: `${env("DB_NAME", "ledger_flow")}_test`,
  },
  production: {
    ...base,
    database: `${env("DB_NAME", "ledger_flow")}_production`,
    use_env_variable: "DATABASE_URL",
  },
};
