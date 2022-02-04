module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "**/tsconfig.json"
    ],
  },
  plugins: [
    "@typescript-eslint",
    "cypress",
    "functional",
    "import",
    "jest",
    "only-warn",
    "simple-import-sort",
    "sort-keys-fix",
    "typescript-sort-keys",
    "unused-imports",
  ],
  ignorePatterns: [
    "**/*.js",
    "pages/**",
  ],
  extends: [
    "eslint:recommended",
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/all",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:functional/all",
    "plugin:import/errors",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:import/warnings",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:prettier/recommended",
    "plugin:typescript-sort-keys/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/naming-convention": ["error", { selector: "default", format: ["strictCamelCase", "PascalCase"] }],
    "@typescript-eslint/no-magic-numbers": "off",
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-type-alias": ["error", { allowLiterals: "always", allowGenerics: "always", }],
    "curly": ["error", "all"],
    "eqeqeq": "error",
    "functional/functional-parameters": "off",
    "functional/no-conditional-statement": "off",
    "functional/no-expression-statement": "off",
    "functional/no-return-void": "off",
    "import/exports-last": "error",
    "import/first": "error",
    "import/no-named-default": "error",
    "import/no-useless-path-segments": "error",
    "max-len": ["error", { "code": 100, "comments": 100, "ignoreStrings": true, "ignoreTemplateLiterals": true }],
    "no-else-return": "error",
    "no-undef-init": "error",
    "no-unsafe-optional-chaining": "error",
    "no-use-before-define": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-destructuring": "error",
    "prefer-template": "error",
    "prettier/prettier": ["error", { "singleQuote": true, "printWidth": 100 }],
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
    "sort-keys-fix/sort-keys-fix": "error",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-imports-ts": "error",
    "unused-imports/no-unused-vars": ["error", { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }],
  },
  overrides: [
    {
      files: [
        "test/**"
      ],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "functional/functional-parameters": "off",
        "functional/no-expression-statement": "off",
        "functional/no-return-void": "off",
      }
    },
    {
      files: [
        "cypress/integration/**/*.spec.ts"
      ],
      rules: {
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "functional/functional-parameters": "off",
        "functional/no-expression-statement": "off",
        "functional/no-return-void": "off",
        "jest/expect-expect": "off",
      }
    }
  ]
}