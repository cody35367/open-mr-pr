# open-mr-pr: Design Spec

## Purpose

A VS Code extension that adds a button to the Source Control view letting
the user jump straight to the "create new merge request / pull request"
page for their current branch, on either GitLab (cloud or self-hosted) or
GitHub, without manually constructing the URL.

## Success criteria

- Clicking the button opens the correct create-MR (GitLab) or create-PR
  (GitHub) URL in the default browser for the current branch of the
  repository whose Source Control section the button lives in.
- Works for GitHub.com, GitLab.com, and self-hosted GitLab instances
  (HTTPS or SSH remotes).
- When a workspace has multiple git repositories open, each repository's
  Source Control section gets its own independent button.

## Out of scope

- Detecting or linking to an *existing* open MR/PR for the branch — the
  button always opens the "create new" page. (GitLab/GitHub's own UI
  will show "there's already an open MR for this branch" if applicable.)
- Explicitly setting a target/base branch in the URL — the platform's
  own default-branch logic handles this.
- Disabling/hiding the button when on the default branch — always
  enabled; clicking it on the default branch just lets the platform's UI
  show its own "nothing to compare" message.
- Authentication, API calls to GitLab/GitHub, or personal access tokens
  — not needed since we only build a URL, we never call the platforms'
  APIs.

## Architecture

Two main pieces, plus the existing extension scaffold:

1. **`src/git-provider-url.js`** — pure functions with no VS Code
   dependency:
   - `parseRemoteUrl(remoteUrl)` → `{ host, scheme, port, path }`
   - `buildMrPrUrl({ host, scheme, port, path }, branchName)` → `string`
     (dispatches to GitHub or GitLab builder based on `host`)
2. **`extension.js`** — VS Code glue:
   - Looks up the built-in Git extension's API.
   - Registers one command, contributed to the `scm/title` menu, that
     resolves the invoking repository, pulls its current branch + remote,
     calls into `git-provider-url.js`, and opens the resulting URL via
     `vscode.env.openExternal`.

Keeping URL parsing/building free of the `vscode` module makes it
directly unit-testable with plain Mocha/assert, no VS Code test harness
needed.

## Git access

Use the built-in Git extension's API rather than shelling out:

```js
const gitExtension = vscode.extensions.getExtension('vscode.git');
const git = gitExtension.exports.getAPI(1);
// git.repositories: Repository[]
```

Each `Repository` exposes:
- `repository.rootUri` — used to match a repo to the invoking SCM title
  button.
- `repository.state.remotes` — array of `{ name, fetchUrl, pushUrl }`.
- `repository.state.HEAD.name` — current branch name (`undefined` if
  detached HEAD).

## Command & menu contribution

`package.json` additions:

```jsonc
"contributes": {
  "commands": [{
    "command": "open-mr-pr.openMrPr",
    "title": "Open MR/PR",
    "icon": "$(link-external)"
  }],
  "menus": {
    "scm/title": [{
      "command": "open-mr-pr.openMrPr",
      "group": "navigation",
      "when": "scmProvider == git"
    }]
  }
}
```

When VS Code invokes a `scm/title` command, it passes the relevant
`SourceControl`'s root `Uri` as the first argument. The handler matches
that `Uri` against `git.repositories[].rootUri` to find the right
`Repository` object. This is what gives each open repository its own
independent button — no manual multi-select handling needed.

Handler logic:

1. Resolve `Repository` from the command argument's root `Uri`. If not
   found, show an error and stop.
2. Read `repository.state.HEAD.name`. If `undefined` (detached HEAD),
   show an error ("No branch is checked out") and stop.
3. Pick the remote: `origin` if present in `repository.state.remotes`,
   otherwise the first entry. If there are no remotes, show an error
   ("No git remote configured") and stop.
4. Use the remote's `fetchUrl` (fall back to `pushUrl` if `fetchUrl` is
   missing).
5. `parseRemoteUrl` → `buildMrPrUrl` → `vscode.env.openExternal(vscode.Uri.parse(url))`.

## URL parsing

`parseRemoteUrl(remoteUrl)` must handle these remote URL shapes:

| Form | Example |
|---|---|
| HTTPS | `https://github.com/owner/repo.git` |
| HTTPS, custom port | `https://gitlab.internal:8443/group/sub/project.git` |
| HTTP (internal, no TLS) | `http://gitlab.internal/group/project.git` |
| SCP-like SSH | `git@gitlab.com:group/sub/project.git` |
| `ssh://` SSH | `ssh://git@gitlab.internal:2222/group/project.git` |

Rules:
- Strip a trailing `.git` suffix from the path if present.
- For `http://`/`https://` remotes: capture `scheme`, `host`, `port`
  (if explicit), and `path` (everything after host[:port], leading
  slash stripped).
- For SCP-like (`user@host:path`) and `ssh://` remotes: `scheme` is
  forced to `https`, `port` is discarded (SSH port is not meaningful for
  the web UI — see design decision below), `host` and `path` are
  extracted from the respective syntaxes.
- `path` may contain multiple segments (GitLab subgroups), e.g.
  `group/subgroup/project`.

**Design decision (confirmed with user):** an SSH remote's port is almost
always an SSH-only port (e.g. a bastion or custom SSH port on a
self-hosted GitLab instance) and does not indicate the web UI's port, so
it's discarded; the web URL is assumed to be plain `https://host/...`.
Only when the remote itself is already `http://`/`https://` is the
scheme and port trusted and reused verbatim, since that's then known to
be the web-facing URL already.

## URL building

`buildMrPrUrl(parsed, branchName)`:

- If `parsed.host === 'github.com'` → GitHub builder.
- Otherwise → GitLab builder (covers gitlab.com and all self-hosted
  instances, per the "default to GitLab" behavior described in the
  extension's purpose).

**GitHub:**
```
{scheme}://{host}{:port}/{path}/pull/new/{branchName}
```
`branchName` is inserted with `/` characters preserved literally (GitHub
treats multi-segment branch names like `feature/foo` as path segments)
and all other characters percent-encoded (`encodeURIComponent`, then
restore literal `/`).

**GitLab:**
```
{scheme}://{host}{:port}/{path}/-/merge_requests/new?merge_request[source_branch]={branchName}
```
Built using `URLSearchParams` for the query string so `branchName` is
correctly percent-encoded as a query value (slashes in query values are
fine either way).

Port is omitted from the output entirely when not explicitly present in
the parsed remote (i.e. don't print `:443`/`:80` defaults).

## Error handling

All failure paths (no matching repository, detached HEAD, no remotes,
unparseable remote URL) show `vscode.window.showErrorMessage` with a
specific, actionable message and abort — no fallback URL is guessed.

## Testing

- `test/git-provider-url.test.js` (new): unit tests for `parseRemoteUrl`
  and `buildMrPrUrl` covering every row in the remote-URL-shapes table
  above, plus: GitHub vs self-hosted GitLab host dispatch, GitLab nested
  subgroups, and branch names containing `/`. Pure functions, so these
  run under plain Mocha without the VS Code test harness.
- `test/extension.test.js` (existing): leave the sample test, optionally
  extend later with an integration-style test once the command is
  registered (lower priority — the VS Code extension host test harness
  is slower and the logic worth testing lives in the pure module).
- Manual smoke test (not automatable in CI): open a real workspace with
  a GitHub-backed repo and one with a GitLab-backed repo, click the
  button in each, confirm the browser opens the expected URL.
