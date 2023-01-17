import https, { RequestOptions } from 'https';

export type RateObj = {
  code: string;
  name: string;
  rate: number;
};

export type RateResponse = RateObj | [RateObj];

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

export const get = (
  code?: string | Callback,
  callback?: Callback,
): Promise<RateResponse> | void => {
  const options = { ...defaultOptions };
  if (typeof code === 'string') {
    options.path += `/${code.toUpperCase()}`;
  }
  if (typeof code === 'function') {
    return returnCallback(options, code);
  } else if (callback) {
    return returnCallback(options, callback);
  } else {
    return returnPromise(options);
  }
};

export default { get };
