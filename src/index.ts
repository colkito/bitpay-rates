import https from 'https';
import { IncomingMessage } from 'http';

export type RateObj = { code: string; name: string; rate: number };
export type RateResponse = RateObj | RateObj[];
export type Callback = (err: Error | null, data?: RateResponse) => void;

export function get(code?: string): Promise<RateResponse>;
export function get(code: string, cb: Callback): void;
export function get(cb: Callback): void;
export function get(codeOrCb?: string | Callback, cb?: Callback): Promise<RateResponse> | void {
  const code = typeof codeOrCb === 'string' ? codeOrCb : undefined;
  const callback = typeof codeOrCb === 'function' ? codeOrCb : cb;

  const p = new Promise<RateResponse>((resolve, reject) => {
    https
      .get(
        `https://bitpay.com/api/rates${code ? `/${code.toUpperCase()}` : ''}`,
        (res: IncomingMessage) => {
          let d = '';
          res.on('data', (c: Buffer) => (d += c));
          res.on('end', () => {
            try {
              const json = JSON.parse(d);
              if (json.error) reject(new Error(json.error));
              else resolve(json.data ?? json);
            } catch (e) {
              reject(e);
            }
          });
        },
      )
      .on('error', reject);
  });

  if (callback) {
    p.then((data) => callback(null, data)).catch((err) => callback(err));
  } else {
    return p;
  }
}

export default get;
