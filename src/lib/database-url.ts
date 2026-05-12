import { Signer } from '@aws-sdk/rds-signer';

const IAM_AUTH_MODE = 'iam';

export async function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  if (env.DATABASE_AUTH_MODE !== IAM_AUTH_MODE) {
    return env.DATABASE_URL;
  }

  const host = requiredEnv(env, 'RDS_HOST');
  const user = requiredEnv(env, 'RDS_USER');
  const region = requiredEnv(env, 'RDS_REGION');
  const port = Number(env.RDS_PORT || 5432);
  const database = env.RDS_DATABASE || 'postgres';

  const signer = new Signer({
    hostname: host,
    port,
    username: user,
    region
  });

  const token = await signer.getAuthToken();
  const params = new URLSearchParams({
    schema: 'public',
    sslmode: 'require',
    connect_timeout: env.DATABASE_CONNECT_TIMEOUT || '30'
  });

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(token)}@${host}:${port}/${database}?${params}`;
}

function requiredEnv(env: NodeJS.ProcessEnv, key: string) {
  const value = env[key];
  if (!value) throw new Error(`${key} is required when DATABASE_AUTH_MODE=iam.`);
  return value;
}
