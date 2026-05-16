/**
 * Returns explicit AWS credentials when RDS_AWS_ACCESS_KEY_ID is present in the
 * environment.  This bypasses the default SDK credential-provider chain, which can
 * be unreliable inside Amplify SSR Lambda cold-starts.
 *
 * Use this helper whenever constructing an AWS SDK client on the server so that
 * every Lambda instance — regardless of which execution-role credentials it
 * happens to have — can authenticate with AWS.
 */
export function getExplicitAwsCredentials(env: NodeJS.ProcessEnv = process.env) {
  if (env.RDS_AWS_ACCESS_KEY_ID && env.RDS_AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: env.RDS_AWS_ACCESS_KEY_ID,
      secretAccessKey: env.RDS_AWS_SECRET_ACCESS_KEY
    };
  }
  return undefined;
}
