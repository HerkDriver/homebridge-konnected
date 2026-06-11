import os from 'node:os';

/**
 * Utility for de-circularizing objects with circular references
 * (used when logging objects that may contain cyclic references).
 */
export const ReplaceCircular = (val: unknown, cache?: WeakSet<object>): unknown => {
  cache = cache || new WeakSet<object>();

  if (val !== null && typeof val === 'object') {
    if (cache.has(val)) {
      return '[Circular]';
    }

    cache.add(val);

    const source = val as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key in source) {
      result[key] = ReplaceCircular(source[key], cache);
    }

    cache.delete(val);
    // preserve array-ness in the output for array inputs
    return Array.isArray(val) ? Object.values(result) : result;
  }

  return val;
};

/**
 * Returns the system's primary non-internal IPv4 address.
 *
 * Replaces the deprecated `ip` npm package (which carried security
 * advisory GHSA-2p57-rm9w-gvfp) with Node's built-in `os` module.
 * Falls back to 0.0.0.0 if no external IPv4 interface is found, which
 * lets the listening server bind to all interfaces.
 */
export const getSystemIpAddress = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      // node >=18 reports family as the string 'IPv4'
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
};
