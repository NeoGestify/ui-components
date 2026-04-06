/** Generates a globally-unique id using the Web Crypto API. */
export const genId = (): string => crypto.randomUUID();
