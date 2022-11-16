{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }: with nixpkgs.legacyPackages.x86_64-linux; {
    devShell.x86_64-linux = mkShellNoCC {
      buildInputs = [
        nodejs-16_x
        nodePackages.pnpm
        playwright
        playwright.browsers-chromium
        actionlint
      ];
      shellHook = ''
        export PLAYWRIGHT_BROWSERS_PATH=${playwright.browsers-chromium}
        export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
        npm_dirs=$(git ls-files | grep pnpm-lock.yaml)
        for npm_dir in $npm_dirs; do
          pnpm install --dir $(dirname "$npm_dir")
        done
      '';
    };
  };
}
