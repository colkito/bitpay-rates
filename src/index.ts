/* tslint:disable:no-empty */

import https from 'https';

export type Callback = (...args: any[]) => void;

export type RateType = {
  code: string;
  name: string;
  rate: number;
};

export const get = (code?: string | Callback, callback?: Callback) => {
  let path = '/rates';
  let cb = callback || ((): void => {});

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
      headers: {},
      agent: false,
    };

    return https
      .get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
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
      })
      .on('error', (err) => {
        reject(err);
        return cb(err);
      });
  });
};

export default { get };
