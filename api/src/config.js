import env from 'getenv'

const conf = {
  port: 3000,
  logLevel: 'debug',
  logColorize: false,
  gzipOff: true,
}

export default {
  port: env.int('port', conf.port),
  gzipOff: env.bool('gzipOff', conf.gzipOff),
  logLevel: env.string('logLevel', conf.logLevel),
  logColorize: env.bool('logColorize', conf.logColorize)
}
