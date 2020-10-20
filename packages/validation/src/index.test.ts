import { Validate } from "./index";
import { Validator } from "./Validator";

describe("Validator", () => {
  const validEmail = "stojce@me.com";
  const invalidEmail = "stojce@com";
  let descriptor = {
    value: function (arg) {
      return arg;
    },
  };

  beforeEach(() => {
    descriptor = {
      value: function (arg) {
        return arg;
      },
    };
  });

  it("should throw on invalid email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(() => descriptor.value(invalidEmail)).toThrow();
  });

  it("should validate valid email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(() => descriptor.value(validEmail)).toBeTruthy();
  });
});
