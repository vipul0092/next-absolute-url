import type { IncomingHttpHeaders, IncomingMessage } from 'http';

const localhostUrl = `localhost:${process.env['PORT'] ?? 3000}`;

/**
 * Get the absolute URL of a Next.js request (Pages Router).
 *
 * @param req - The Next.js / Node.js `IncomingMessage` request object (optional).
 * @param localhostAddress - Fallback host when none can be detected. Defaults to `"localhost:3000"`.
 * @returns An object with `{ protocol, host, origin }`.
 *
 * @example
 * // pages/api/example.ts
 * import absoluteUrl from 'next-absolute-url';
 *
 * export default function handler(req, res) {
 *   const { origin } = absoluteUrl(req);
 *   res.json({ origin });
 * }
 */
function absoluteUrl(req?: IncomingMessage, localhostAddress = localhostUrl) {
  return absoluteUrlWithHeaders(req?.headers, localhostAddress);
}

/**
 * Get the absolute URL from a `Headers` object or plain headers record.
 * Designed for use with the Next.js App Router (`await headers()` from `next/headers`).
 *
 * @param headers - A Web API `Headers` instance or a Node.js `IncomingHttpHeaders` record (optional).
 * @param localhostAddress - Fallback host when none can be detected. Defaults to `"localhost:3000"`.
 * @returns An object with `{ protocol, host, origin }`.
 *
 * @example
 * // app/api/example/route.ts
 * import { headers } from 'next/headers';
 * import { absoluteUrlWithHeaders } from 'next-absolute-url';
 *
 * export async function GET() {
 *   const { origin } = absoluteUrlWithHeaders(await headers());
 *   return Response.json({ origin });
 * }
 */
export function absoluteUrlWithHeaders(
  headers?: Headers | IncomingHttpHeaders,
  localhostAddress = localhostUrl
) {
  const forwardedHost = getFirstForwardHeader('x-forwarded-host', headers);
  const hostHeader = headers && 'host' in headers ? headers.host : undefined;
  const host = forwardedHost || hostHeader || windowHost() || localhostAddress;

  const forwardedProtocol = getFirstForwardHeader('x-forwarded-proto', headers);
  const protocol = `${forwardedProtocol ?? (isLocalNetwork(host) ? 'http' : 'https')}:`;

  const origin = `${protocol}//${host}`;

  return { protocol, host, origin };
}

function getFirstForwardHeader(
  headerName: 'x-forwarded-host' | 'x-forwarded-proto',
  headers?: Headers | IncomingHttpHeaders
): string | undefined {
  return getHeaderValue(headerName, headers);
}

function getHeaderValue(headerName: string, headers?: Headers | IncomingHttpHeaders): string | undefined {
  let value: string | string[] | undefined;
  if (headers instanceof Headers) {
    value = headers.get(headerName) || undefined;
  } else if (headers && typeof headers === 'object') {
    value = (headers as IncomingHttpHeaders)[headerName];
  }
  return value && typeof value === 'string' ? value.split(',')[0] : undefined;
}

function isLocalNetwork(hostname = windowHost()) {
  return (
    hostname.startsWith('localhost') ||
    hostname.startsWith('127.0.0.1') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.0.') ||
    hostname.endsWith('.local')
  );
}

function windowHost() {
  return typeof window !== 'undefined' ? window.location.host : '';
}

export default absoluteUrl;
