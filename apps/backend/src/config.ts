import env from 'env-var'

export const config = {
  NODE_ENV: env.get('NODE_ENV').default('development').asEnum(['production', 'development']),
  APP_PORT: env.get('APP_PORT').default(3000).asPortNumber(),

  REDIS_HOST: env.get('REDIS_HOST').default('localhost').asString(),
  REDIS_PORT: env.get('REDIS_PORT').default(6379).asPortNumber(),
  REDIS_DB: env.get('REDIS_DB').default(1).asIntPositive(),

  DATABASE_URL: env.get('DATABASE_URL').required().asString(),

  OPENAPI_PATH: env.get('OPENAPI_PATH').default('/openapi').asString(),

  // 登录状态过期时间, 单位为秒, 默认为7天
  LOGIN_ID_EXPIRE: env.get('LOGIN_ID_EXPIRE').default(60 * 60 * 24 * 7).asIntPositive(),
}

export const bdwp_config = {
  BROWSER_USERAGENT: env
    .get('BROWSER_USERAGENT')
    .default(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    )
    .asString(),
  WX_USERAGENT: env
    .get('WX_USERAGENT')
    .default(
      'Mozilla/5.0 (Linux; Android 7.1.1; MI 6 Build/NMF26X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/043807 Mobile Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/4G Language/zh_CN MicroMessenger/6.6.1.1220(0x26060135) NetType/4G Language/zh_CN miniProgram',
    )
    .asString(),
  UNAUTH_COOKIE: env
    .get('UNAUTH_COOKIE')
    .default(
      'BAIDUID=C01A084D05AEC2A819634D1C9DC409B5:FG=1;BAIDUID_BFESS=C01A084D05AEC2A819634D1C9DC409B5:FG=1;newlogin=1;csrfToken=wv5coZ12V0cUcdTuAf2wkp9p',
    )
    .asString(),

  PC_USERAGENT: env
    .get('PC_USERAGENT')
    .default('netdisk;8.1.6.101;PC;PC-Windows;10.0.26200;WindowsBaiduYunGuanJia')
    .asString(),

  PC_VERSION: env.get('PC_VERSION').default('8.1.6.101').asString(),
  WX_VERSION: env.get('WX_VERSION').default('2.9.6').asString(),

  WEB_CLIENTTYPE: env.get('WEB_CLIENTTYPE').default('0').asString(),
  PC_CLIENTTYPE: env.get('PC_CLIENTTYPE').default('8').asString(),
  ANDROID_CLIENTTYPE: env.get('ANDROID_CLIENTTYPE').default('21').asString(),
  WX_CLIENTTYPE: env.get('WX_CLIENTTYPE').default('25').asString(),

  WEB_CHANNEL: env.get('WEB_CHANNEL').default('chunlei').asString(),
  PC_CHANNEL: env.get('PC_CHANNEL').default('00000000000000000000000040000001').asString(),
  WX_CHANNEL: env.get('WX_CHANNEL').default('weixin').asString(),

  WEB_APP_ID: env.get('WEB_APP_ID').default('250528').asString(),
  ENTERPRISE_APP_ID: env.get('ENTERPRISE_APP_ID').default('24029990').asString(),
  ENTERPRISE_TK_APP_ID: env.get('ENTERPRISE_TK_APPID').default('10000').asString(),
}
