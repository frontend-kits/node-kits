/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ['<rootDir>/packages/(?:.+?)/lib/'],
    coveragePathIgnorePatterns: ['<rootDir>/packages/(?:.+?)/lib/']
}
