import * as dotenv from 'dotenv'

dotenv.config()

const requireEnvVar = <T>(value: T | undefined, name: string) => {
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`)
  }

  return value
}

const env = {
  port: requireEnvVar(process.env.PORT, 'PORT'),
  sessionSecret: requireEnvVar(process.env.SESSION_SECRET, 'SESSION_SECRET'),
  nodeEnv: process.env.NODE_ENV || 'development',
}

export {env}
