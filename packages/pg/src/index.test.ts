import PostgresDB from "./index";
// const { Query } = jest.requireActual("pg");

jest.mock("pg", () => {
  const mockClient = {
    query: jest.fn((query, args) => {
      return {
        rowCount: 1,
        rows: [{ item: { query, args } }],
      };
    }),
    release: jest.fn(() => {
      return mockClient;
    }),
  };

  const mockPool = {
    connect: jest.fn(() => {
      return mockClient;
    }),
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe("PostgresDB", () => {
  let db: PostgresDB;
  beforeEach(() => {
    db = new PostgresDB("");
  });

  it("getById without filter", async () => {
    const expQery =
      "SELECT to_json(tmp.*) as item FROM (SELECT * FROM test_table WHERE id in ($1) ) as tmp";
    const result = (await db.getById("test_table", "123")) as { args; query };
    expect(expQery).toBe(result.query);
    expect(["123"]).toEqual(result.args);
  });

  /**
   * Tests
   */
  it("getById with filter", async () => {
    const expQery =
      "SELECT to_json(tmp.*) as item FROM (SELECT * FROM test_table WHERE id in ($1) WHERE first_filter=$2) as tmp";
    const result = (await db.getById("test_table", "123", {
      firstFilter: "234",
    })) as { args; query };

    expect(expQery).toBe(result.query);
    expect(["123", "234"]).toEqual(result.args);
  });

  it("getByIds without filter", async () => {
    const expQery =
      "SELECT to_json(tmp.*) as item FROM (SELECT * FROM test_table WHERE id in ($1,$2) ) as tmp";
    const result = (await db.getByIds("test_table", ["123", "567"])) as {
      args;
      query;
    }[];

    expect(result[0].query).toBe(expQery);
    expect(["123", "567"]).toEqual(result[0].args);
  });

  it("getByIds with filter", async () => {
    const expQery =
      "SELECT to_json(tmp.*) as item FROM (SELECT * FROM test_table WHERE id in ($1,$2) WHERE first_filter=$3) as tmp";
    const result = (await db.getByIds("test_table", ["123", "567"], {
      firstFilter: "234",
    })) as {
      args;
      query;
    }[];

    expect(result[0].query).toBe(expQery);
    expect(["123", "567", "234"]).toEqual(result[0].args);
  });

  it("getByIds with filters", async () => {
    const expQery =
      "SELECT to_json(tmp.*) as item FROM (SELECT * FROM test_table WHERE id in ($1,$2) WHERE main_filter=$3 AND second_filter=$4) as tmp";
    const result = (await db.getByIds("test_table", ["123", "567"], {
      mainFilter: "234",
      secondFilter: "888",
    })) as {
      args;
      query;
    }[];

    expect(result[0].query).toBe(expQery);
    expect(["123", "567", "234", "888"]).toEqual(result[0].args);
  });
});
