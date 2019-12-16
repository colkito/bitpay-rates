const nock = require("nock");

const bitpayRates = require("../src");
const code = "ARS";

describe("Get User tests", () => {
  beforeEach(() => {
    nock("https://bitpay.com")
      .persist()
      .get(`/rates/${code}`)
      .reply(200, {
        data: {
          code
        }
      });
  });

  it("Get a rate by code using Promises", async () => {
    const rate = await bitpayRates.get(code);
    expect(typeof rate).toEqual("object");
    expect(rate.code).toEqual(code);
  });

  it("Get a rate by code using Callback", () => {
    bitpayRates.get(code, (err, rate) => {
      expect(typeof rate).toEqual("object");
      expect(rate.code).toEqual(code);
    });
  });
});
