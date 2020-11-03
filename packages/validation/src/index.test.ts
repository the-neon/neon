import { Validate } from "./index";
import { Validator } from "./Validator";

describe("Email Validator", () => {
  const validEmail = "stojce@me.com";
  const invalidEmail = "stojce@com";
  const emptyEmail = "";
  const nullEmail = null;
  let undefinedEmail: string;

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

  it("should validate valid email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(descriptor.value(validEmail)).toBeTruthy();
  });

  it("should pass on empty email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(descriptor.value(emptyEmail)).toBeDefined();
  });

  it("should pass on undefined email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(descriptor.value(undefinedEmail)).toBeUndefined();
  });

  it("should pass on null email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(descriptor.value(nullEmail)).toEqual(null);
  });

  it("should throw on invalid email", () => {
    Validate({ arg: Validator.email })({}, "", descriptor);
    expect(() => descriptor.value(invalidEmail)).toThrow();
  });
});

describe("UUID Validator", () => {
  const validUuid1 = "3fd11358-0ec4-11eb-b776-06e5e0b8a9ad";
  const validUuid2 = "00000000-0000-0000-0000-000000000000";
  const invalidUuid1 = "Vfd11358-0ec4-11eb-b776-06e5e0b8a9ad";
  const invalidUuid2 = "0000-0000-0000-000000000000";
  const invalidUuid3 = "Vfd11358-0ec4-11eb-b776-06e5e0b8a9adf";
  const emptyUuid = "";

  let nullUuid: string;

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

  it("should pass on valid UUID 1", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(descriptor.value(validUuid1)).toBeTruthy();
  });

  it("should pass on valid UUID 2", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(descriptor.value(validUuid2)).toBeTruthy();
  });

  it("should pass on empty uuid", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(descriptor.value(emptyUuid)).toBeDefined();
  });

  it("should pass on null uuid", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(descriptor.value(nullUuid)).toBeFalsy();
  });

  it("should throw on invalid uuid 1", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(() => descriptor.value(invalidUuid1)).toThrow();
  });

  it("should throw on invalid uuid 2", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(() => descriptor.value(invalidUuid2)).toThrow();
  });

  it("should throw on invalid uuid 3", () => {
    Validate({ arg: Validator.uuid })({}, "", descriptor);
    expect(() => descriptor.value(invalidUuid3)).toThrow();
  });
});

describe("`Not Empty` Validator", () => {
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

  // String
  const validString = "stojce";
  const emptyString = "";
  let nullString: string;

  it("should pass on valid string", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validString)).toBeTruthy();
  });

  it("should throw on empty string", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(emptyString)).toThrow();
  });

  it("should throw on null string", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(nullString)).toThrow();
  });

  // Number
  const validNumber1 = 12;
  const validNumber2 = 0;
  const validNumber3 = -12;
  let nullNumber: number;

  it("should pass on valid number 1", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validNumber1)).toBeDefined();
  });

  it("should pass on valid number 2", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validNumber2)).toBeDefined();
  });

  it("should pass on valid number 3", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validNumber3)).toBeDefined();
  });

  it("should throw on null number", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(nullNumber)).toThrow();
  });

  // Bool
  const validBool1 = true;
  const validBool2 = false;
  let nullBool: boolean;

  it("should pass on valid bool 1", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validBool1)).toBeTruthy();
  });

  it("should pass on valid bool 2", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validBool2)).toBeFalsy();
  });

  it("should throw on null bool", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(nullBool)).toThrow();
  });

  // Array

  const validArray = [2, 3];
  const emptyArray = [];
  let nullArray: unknown[];
  it("should pass on valid array 1", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validArray)).toBeTruthy();
  });

  it("should throw on empty array", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(emptyArray)).toThrow();
  });

  it("should throw on null array", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(nullArray)).toThrow();
  });

  // Obj
  const validObj = { id: 1 };
  const emptyObj = {};
  let nullObj: { id: unknown };

  it("should pass on valid obj 1", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(descriptor.value(validObj)).toBeDefined();
  });

  it("should throw on empty obj", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(emptyObj)).toThrow();
  });

  it("should throw on null number", () => {
    Validate({ arg: Validator.notEmpty })({}, "", descriptor);
    expect(() => descriptor.value(nullObj)).toThrow();
  });
});
