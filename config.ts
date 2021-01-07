export const inDev = (() => process.env.NODE_ENV == 'development')();

export const paths = {
  web: inDev ? '../web-client/release/web_client' : '../web_client'
};