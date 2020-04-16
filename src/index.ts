import { request } from 'https';

export type Callback = (...args: any[]) => void

export function get(code: string, callback: Callback) {
  let path = '/rates';
  let cb = callback || function() {};

  if (code) {
    if (typeof code === 'function') {
      cb = code;
    } else if (typeof code === 'string') {
      path += `/${code.toUpperCase()}`;
    }
  }

  return new Promise((resolve, reject) => {
    const options = {
      host: 'bitpay.com',
      path,
      method: 'GET',
      headers: {},
      agent: false
    };

    const req = request(options);

    req.end();

    req.on('error', (err: any) => {
      reject(err);
      return cb(err);
    });

    req.on('response', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk.toString('utf8');
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data);
          return cb(null, parsed.data);
        } catch (err) {
          reject(err);
          return cb(err);
        }
      });
    });
  });
};
