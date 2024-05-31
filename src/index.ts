import https, { RequestOptions } from 'https';

export type RateObj = {
  code: string;
  name: string;
  rate: number;
};

export type RateResponse = RateObj | [RateObj];

/**
 * @deprecated Callback support will be removed in a future version. Use the Promise-based API instead.
 */
export type Callback = (error: Error | null, data?: RateResponse) => void;

const defaultOptions: RequestOptions = {
  host: 'bitpay.com',
  path: '/rates',
  headers: {},
  agent: false,
};

const returnPromise = (options: RequestOptions): Promise<RateResponse> => {
  return new Promise((resolve, reject) => {
    returnCallback(options, (err, data) => {
      if (err) return reject(err);
      return resolve(data as RateResponse);
    });
  });
};

/**
 * @deprecated Callback support will be removed in a future version. Use the Promise-based API instead.
 */
const returnCallback = (options: RequestOptions, callback: Callback): void => {
  https
    .get(options, (res) => {
      let dataBuffer = '';

      res.on('data', (chunk: Buffer) => {
        dataBuffer += chunk.toString('utf8');
      });

      res.on('end', () => {
        try {
          const { data } = JSON.parse(dataBuffer);
          return callback(null, data);
        } catch (err) {
          return callback(err as Error);
        }
      });
    })
    .on('error', (err) => {
      return callback(err as Error);
    });
};

export const get = (code?: string): Promise<RateResponse> => {
  const options = { ...defaultOptions };
  if (typeof code === 'string') {
    options.path += `/${code.toUpperCase()}`;
  }
  return returnPromise(options);
};

export default { get };
