with (import <nixpkgs> { });
mkShell {
  buildInputs = [
    nodejs-16_x
    jdk
    nodePackages.pnpm
    nodePackages.eslint_d
  ];
}

