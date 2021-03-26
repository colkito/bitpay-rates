import * as https from 'https';

export type Callback = (...args: any[]) => void;

export type RateType = {
  code: string;
  name: string;
  rate: number;
};

const returnPromise = (options: any): Promise<RateType> => {
  return new Promise((resolve, reject) => {
    returnCallback(options, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

const returnCallback = (options: any, callback: Callback): void => {
  https
    .get(options, (res: any) => {
      let dataBuffer = '';

      res.on('data', (chunk: any) => {
        dataBuffer += chunk.toString('utf8');
      });

      res.on('end', () => {
        try {
          const { data } = JSON.parse(dataBuffer);
          return callback(null, data);
        } catch (err) {
          return callback(err);
        }
      });
    })
    .on('error', (err: any) => {
      return callback(err);
    });
};

export const get = (
  code?: string | Callback,
  callback?: Callback,
): Promise<RateType> | Promise<[RateType]> | void => {
  const options = {
    host: 'bitpay.com',
    path: '/rates',
    headers: {},
    agent: false,
  };

  if (typeof code === 'function') {
    return returnCallback(options, code);
  } else if (typeof code === 'string') {
    options.path += `/${code.toUpperCase()}`;
    if (callback) {
      return returnCallback(options, callback);
    }
    return returnPromise(options);
  } else if (typeof code === 'undefined') {
    return returnPromise(options);
  }
};

export default { get };
