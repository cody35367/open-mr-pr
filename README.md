# Open MR PR

This is a vscode extension that provides buttons in the default source control view for opening gitlab and github PRs quickly.

# Install Node

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
# Restart shell
nvm install node
```

# How it was created

```bash
npx --package yo --package generator-code -- yo code
Need to install the following packages:
yo@7.0.1
generator-code@1.12.0
Ok to proceed? (y) y
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'which@7.0.0',
npm warn EBADENGINE   required: { node: '^22.22.2 || ^24.15.0 || >=26.0.0' },
npm warn EBADENGINE   current: { node: 'v25.9.0', npm: '11.12.1' }
npm warn EBADENGINE }
npm warn deprecated boolean@3.2.0: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.

     _-----_     ╭──────────────────────────╮
    |       |    │   Welcome to the Visual  │
    |--(o)--|    │   Studio Code Extension  │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |     
   __'.___.'__   
 ´   `  |° ´ Y ` 

`list` prompt is deprecated. Use `select` prompt instead.
✔ What type of extension do you want to create? New Extension (JavaScript)
✔ What's the name of your extension? open-mr-pr
✔ What's the identifier of your extension? open-mr-pr
✔ What's the description of your extension? This is a vscode extension that provides buttons in the default source control view for opening gitlab and github PRs quickly.
✔ Enable JavaScript type checking in 'jsconfig.json'? Yes
✔ Initialize a git repository? No
`list` prompt is deprecated. Use `select` prompt instead.
✔ Which package manager to use? npm

Writing in /home/chodges/repos/open-mr-pr/open-mr-pr...
   create open-mr-pr/.vscode/extensions.json
   create open-mr-pr/.vscode/launch.json
   create open-mr-pr/test/extension.test.js
   create open-mr-pr/.vscodeignore
   create open-mr-pr/README.md
   create open-mr-pr/CHANGELOG.md
   create open-mr-pr/vsc-extension-quickstart.md
   create open-mr-pr/jsconfig.json
   create open-mr-pr/extension.js
   create open-mr-pr/package.json
   create open-mr-pr/.vscode-test.mjs
   create open-mr-pr/eslint.config.mjs

Changes to package.json were detected.

Running npm install for you to install the required dependencies.
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

added 224 packages, and audited 225 packages in 3s

62 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Your extension open-mr-pr has been created!

To start editing with Visual Studio Code, use the following commands:

     code open-mr-pr

Open vsc-extension-quickstart.md inside the new extension for further instructions
on how to modify, test and publish your extension.

For more information, also visit http://code.visualstudio.com and follow us @code.


`list` prompt is deprecated. Use `select` prompt instead.
✔ Do you want to open the new folder with Visual Studio Code? Skip
npm notice
npm notice New minor version of npm available! 11.12.1 -> 11.21.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.21.0
npm notice To update run: npm install -g npm@11.21.0
npm notice
```

# Package and Install
```bash
npx --package @vscode/vsce -- vsce package
code --install-extension open-mr-pr-1.0.0.vsix
```