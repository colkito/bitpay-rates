import * as https from 'https';
import { IncomingMessage } from 'node:http';

type EmptyObject = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => void;

type RateObj = {
  code: string;
  name: string;
  rate: number;
};

type OptionsObj = {
  host: string;
  path: string;
  headers: EmptyObject;
  agent: boolean;
};

const returnPromise = (options: OptionsObj): Promise<RateObj> => {
  return new Promise((resolve, reject) => {
    returnCallback(options, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

const returnCallback = (options: OptionsObj, callback: Callback): void => {
  https
    .get(options, (res: IncomingMessage) => {
      let dataBuffer = '';

      res.on('data', (chunk: Buffer) => {
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
    .on('error', (err: Error) => {
      return callback(err);
    });
};

export const get = (
  code?: string | Callback,
  callback?: Callback,
): Promise<RateObj> | Promise<[RateObj]> | void => {
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
