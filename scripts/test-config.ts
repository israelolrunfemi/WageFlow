import { env, APP_NAME } from '../src/config/index.js'

console.log('App:', APP_NAME)
console.log('Env:', env.NODE_ENV)
console.log('Bot token exists:', !!env.BOT_TOKEN)