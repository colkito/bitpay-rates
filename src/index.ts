import type { RequestOptions } from 'https';

export type RateObj = {
  code: string;
  name: string;
  rate: number;
};

export type RateResponse = RateObj | [RateObj];

const defaultOptions: RequestOptions = {
  host: 'bitpay.com',
  path: '/rates',
  headers: {},
  agent: false,
};

const returnPromise = (options: RequestOptions): Promise<RateResponse> => {
  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        let dataBuffer = '';

        res.on('data', (chunk: Buffer) => {
          dataBuffer += chunk.toString('utf8');
        });

        res.on('end', () => {
          try {
            const { data } = JSON.parse(dataBuffer);
            return resolve(data);
          } catch (err) {
            return reject(err as Error);
          }
        });
      })
      .on('error', (err) => {
        return reject(err as Error);
      });
  });
};

export const get = (code?: string): Promise<RateResponse> => {
  if (typeof code === 'string') {
    defaultOptions.path += `/${code.toUpperCase()}`;
  }
  return returnPromise(defaultOptions);
};

export default { get };
