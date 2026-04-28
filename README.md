# @vipul0092/next-absolute-url

Get the absolute URL of a Next.js request — works with both the **App Router** and the **Pages Router**, as well as behind reverse proxies.

## Why

Next.js does not expose a built-in way to derive the full origin (`https://example.com`) of the current request. This is especially needed when you need to construct absolute URLs server-side (e.g. for redirects, canonical links, or calling your own API).

This package handles:

- `x-forwarded-host` / `x-forwarded-proto` headers set by reverse proxies and load balancers
- Local-network detection for automatic `http`/`https` protocol selection
- Both the Node.js `IncomingMessage` shape (Pages Router) and the Web `Headers` API (App Router)
- **Client-side** — falls back to `window.location.host` when called in the browser
- **Dual module build** — ships both CommonJS (`require`) and ES Modules (`import`) so it works out of the box with any bundler or runtime

## Installation

```bash
npm install @vipul0092/next-absolute-url
# or
pnpm add @vipul0092/next-absolute-url
# or
yarn add @vipul0092/next-absolute-url
```

## API

### `absoluteUrl(req?, localhostAddress?)` _(default export)_

For use in the **Pages Router**. Accepts an optional `IncomingMessage` request object.

| Parameter          | Type              | Default                              | Description                              |
| ------------------ | ----------------- | ------------------------------------ | ---------------------------------------- |
| `req`              | `IncomingMessage` | `undefined`                          | The Next.js / Node.js request object.    |
| `localhostAddress` | `string`          | `localhost:$PORT` (fallback `3000`)  | Fallback host when none can be detected. |

### `absoluteUrlWithHeaders(headers?, localhostAddress?)` _(named export)_

For use in the **App Router**. Accepts either a Web API `Headers` instance or a plain `IncomingHttpHeaders` record.

| Parameter          | Type                               | Default                              | Description                              |
| ------------------ | ---------------------------------- | ------------------------------------ | ---------------------------------------- |
| `headers`          | `Headers \| IncomingHttpHeaders`   | `undefined`                          | Request headers.                         |
| `localhostAddress` | `string`                           | `localhost:$PORT` (fallback `3000`)  | Fallback host when none can be detected. |

Both functions return:

```ts
{
  protocol: string; // e.g. "https:"
  host: string;     // e.g. "example.com"
  origin: string;   // e.g. "https://example.com"
}
```

## Usage

### App Router

In the App Router, use `headers()` from `next/headers` (available in Server Components, Route Handlers, and Server Actions).

```ts
// app/api/example/route.ts
import { headers } from 'next/headers';
import { absoluteUrlWithHeaders } from '@vipul0092/next-absolute-url';

export async function GET() {
  const { origin } = absoluteUrlWithHeaders(await headers());
  return Response.json({ origin });
}
```

```ts
// app/some-page/page.tsx  (Server Component)
import { headers } from 'next/headers';
import { absoluteUrlWithHeaders } from '@vipul0092/next-absolute-url';

export default async function Page() {
  const { origin } = absoluteUrlWithHeaders(await headers());
  // e.g. construct a canonical URL
  const canonical = `${origin}/some-page`;
  return <link rel="canonical" href={canonical} />;
}
```

### Pages Router

In the Pages Router, pass the `req` object available from `getServerSideProps` or API route handlers.

```ts
// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import absoluteUrl from '@vipul0092/next-absolute-url';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin } = absoluteUrl(req);
  res.json({ origin });
}
```

```ts
// pages/some-page.tsx
import type { GetServerSideProps } from 'next';
import absoluteUrl from '@vipul0092/next-absolute-url';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { origin } = absoluteUrl(req);
  return { props: { origin } };
};

export default function Page({ origin }: { origin: string }) {
  return <p>Origin: {origin}</p>;
}
```

### Client-side

The library also works in the browser. When called with no arguments it reads `window.location.host`, so you get the correct origin without any server context.

```ts
// Any client component
import absoluteUrl from '@vipul0092/next-absolute-url';

const { origin } = absoluteUrl();
console.log(origin); // e.g. "https://example.com"
```

## Protocol detection

| Condition                                                        | Protocol |
| ---------------------------------------------------------------- | -------- |
| `x-forwarded-proto` header is present                            | Value of header (first entry if comma-separated) |
| Host starts with `localhost`, `127.0.0.1`, `192.168.*`, `10.0.*`, or ends with `.local` | `http` |
| Everything else                                                  | `https`  |

## License

MIT
