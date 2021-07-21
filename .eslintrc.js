module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "jquery",
    ],
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
        ],
        "space-in-parens": [
            "off"
        ],
        "brace-style": [
            "off"
        ],
        "lines-around-comment": [
            "off"
        ],
        "space-before-function-paren": [
            "off"
        ],
        "max-len": [
            "off"
        ],
        "computed-property-spacing": [
            "off"
        ],
        "array-bracket-spacing": [
            "off"
        ],
        "camelcase": [
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
        "DisplayedMessage_MODULE": "readable",
        "jQuery": "writeable",
        "$": "readable",
        "Scoreboard_MODULE": "writeable"
    }
};
