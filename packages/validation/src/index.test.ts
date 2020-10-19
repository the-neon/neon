import { Validate } from "./index";
import { Validator } from "./Validator";

describe("Validator", () => {
  const validEmail = "stojce@me.com";
  const invalidEmail = "stojce@com";
  let descriptor = {
    value: (arg) => {
      return arg;
    },
  };

  beforeEach(() => {
    descriptor = {
      value: (arg) => {
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
