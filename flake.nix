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
        pnpm install 
        (cd e2e/nextjs && pnpm install)
        (cd e2e/provider && pnpm install)
      '';
    };
  };
}
