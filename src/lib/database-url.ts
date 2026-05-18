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

  // Lambda + Aurora-Serverless-v2 + Prisma tuning:
  //  - connection_limit=1: each Lambda container handles one request at a time,
  //    so opening 5 connections (the Prisma default) is wasted work that
  //    *causes* pool-timeout errors on cold start.
  //  - pool_timeout=60 / connect_timeout=60: Aurora Serverless v2 with
  //    MinCapacity=0 auto-pauses after 5 min of idle. Waking it back up takes
  //    15-30s of repeated connection attempts. These timeouts give the wake-up
  //    enough time to complete before Prisma errors out. Retry logic in
  //    public-query handles the cases where individual attempts still fail.
  const params = new URLSearchParams({
    schema: 'public',
    sslmode: 'require',
    connect_timeout: env.DATABASE_CONNECT_TIMEOUT || '60',
    pool_timeout: env.DATABASE_POOL_TIMEOUT || '60',
    connection_limit: env.DATABASE_CONNECTION_LIMIT || '1'
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
