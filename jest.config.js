// module.exports = {
//     // Add this line to your Jest config
//     setupFilesAfterEnv: ['./jest.setup.js'],
// }

module.exports = {
    testEnvironment: "jest-environment-nwjs",
    globalTeardown: "jest-environment-nwjs/teardown",
};