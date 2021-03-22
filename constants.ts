

export const inDev  = (() => process.env.NODE_ENV == 'development')();
export const inProd = (() => !inDev)();

/** 30 days in milliseconds */
export const monthInMs = 1000 * 60 * 60 * 24 * 30;

export const yearInMs = 1000 * 60 * 60 * 24 * 365;

