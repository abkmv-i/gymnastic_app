const path = require('path');

module.exports = {
    // ... ваши другие настройки
    resolve: {
        fallback: {
            "timers": require.resolve("timers-browserify"),
            "buffer": require.resolve("buffer/"),
        }
    },
    // ... ваши другие настройки
};
