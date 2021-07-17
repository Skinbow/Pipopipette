module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 6,
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "off"
        ]
    },
    "globals": {
        "socket": "writeable",
        "serialize": "readable",
        "io": "writeable",
        "players": "writeable",
        "Game_MODULE": "writeable",
        "Form_MODULE": "writeable",
        "DisplayedMessage_MODULE": "readable"
    }
};
