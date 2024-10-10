import "dotenv/config";

const envs = [
  "API_URL",
  "STOREFRONT_URL",
  "COOKIE_SECRET",
  "SUPERADMIN_USERNAME",
  "SUPERADMIN_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_SCHEMA",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "SMTP_USERNAME",
  "SMTP_PASSWORD",
  "SMTP_HOST",
  "SMTP_PORT",
] as const;

export const getEnvs = () => {
  const missingEnvs = envs.filter((env) => !process.env[env]);
  if (missingEnvs.length) {
    throw new Error(`Missing environment variables: ${missingEnvs.join(", ")}`);
  }
  return envs.reduce((acc, env) => {
    acc[env as (typeof envs)[number]] = `${process.env[env]}`;
    return acc;
  }, {} as Record<(typeof envs)[number], string>);
};
