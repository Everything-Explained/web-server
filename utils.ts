import staticGZIP from 'express-static-gzip';


export function loadStaticFrom(dir: string, cache: 'cache'|'no-cache') {
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  const options = {
    enableBrotli: true,
    orderPreference: ['br']
  } as any;
  if (cache == 'cache') {
    options.serveStatic = {
      maxAge: thirtyDays
    };
  }
  else options.serveStatic = { cacheControl: false };
  return staticGZIP(dir, options);
}