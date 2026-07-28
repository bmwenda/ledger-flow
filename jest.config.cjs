module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": "babel-jest"
  },
  testMatch: ["**/__tests__/**/*.test.ts"]
};
