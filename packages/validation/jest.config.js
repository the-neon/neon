module.exports = {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react" } }],
  },
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/lib/", "<rootDir>/node_modules/"],
};
