import * as dotenv from "dotenv";

dotenv.config();

const requireEnvVar = <T>(value: T | undefined, name: string) => {
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
};

const env = {
  port: requireEnvVar(process.env.PORT, "port"),
  sessionSecret: requireEnvVar(process.env.SESSION_SECRET, "sessionSecret"),
  nodeEnv: process.env.NODE_ENV || "development",
  validateOnChain:
    (process.env.VALIDATE_ON_CHAIN || "false").toLowerCase().trim() === "true",
  web3Provider: process.env.WEB3_PROVIDER || ""
};

export { env };
