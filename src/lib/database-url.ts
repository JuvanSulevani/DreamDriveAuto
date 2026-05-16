import { Signer } from '@aws-sdk/rds-signer';

const IAM_AUTH_MODE = 'iam';
const POSTGRES_URL_PATTERN = /^postgres(ql)?:\/\//;

export async function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  if (isPostgresUrl(env.DATABASE_URL)) {
    return env.DATABASE_URL;
  }

  if (env.DATABASE_AUTH_MODE !== IAM_AUTH_MODE) {
    return env.DATABASE_URL;
  }

  if (!env.RDS_HOST || !env.RDS_USER || !env.RDS_REGION) {
    console.error(
      '[database-url] DATABASE_AUTH_MODE=iam requires RDS_HOST, RDS_USER, and RDS_REGION unless DATABASE_URL is set.'
    );
    return env.DATABASE_URL;
  }

  const host = env.RDS_HOST;
  const user = env.RDS_USER;
  const region = env.RDS_REGION;
  const port = Number(env.RDS_PORT || 5432);
  const database = env.RDS_DATABASE || 'postgres';

  // If explicit RDS credentials are provided (via RDS_AWS_ACCESS_KEY_ID / RDS_AWS_SECRET_ACCESS_KEY),
  // pass them directly to the Signer so it doesn't rely on the Lambda credential provider chain,
  // which can be unreliable in Amplify SSR Lambda cold-starts.
  const explicitCredentials =
    env.RDS_AWS_ACCESS_KEY_ID && env.RDS_AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: env.RDS_AWS_ACCESS_KEY_ID, secretAccessKey: env.RDS_AWS_SECRET_ACCESS_KEY }
      : undefined;

  const signer = new Signer({
    hostname: host,
    port,
    username: user,
    region,
    ...(explicitCredentials && { credentials: explicitCredentials })
  });

  let token: string;
  try {
    token = await signer.getAuthToken();
  } catch (error) {
    console.error(
      '[database-url] Unable to create an IAM database auth token. Attach AWS runtime credentials or set DATABASE_URL to a PostgreSQL connection string.',
      error
    );
    return env.DATABASE_URL;
  }

  const params = new URLSearchParams({
    schema: 'public',
    sslmode: 'require',
    connect_timeout: env.DATABASE_CONNECT_TIMEOUT || '30'
  });

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(token)}@${host}:${port}/${database}?${params}`;
}

export function hasUsableDatabaseConfig(env: NodeJS.ProcessEnv = process.env) {
  if (isPostgresUrl(env.DATABASE_URL)) return true;

  if (env.DATABASE_AUTH_MODE === IAM_AUTH_MODE) {
    return Boolean(env.RDS_HOST && env.RDS_USER && env.RDS_REGION);
  }

  return false;
}

function isPostgresUrl(url: string | undefined) {
  return Boolean(url && POSTGRES_URL_PATTERN.test(url));
}
