

export const inDev  = (() => process.env.NODE_ENV == 'development')();
export const inProd = (() => !inDev)();

/** 30 days in milliseconds */
export const thirtyDays = 1000 * 60 * 60 * 24 * 30;