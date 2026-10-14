const assert = require('assert');
const { parseRemoteUrl, buildMrPrUrl } = require('../src/git-provider-url');

suite('git-provider-url: parseRemoteUrl', () => {
	test('parses an HTTPS GitHub remote', () => {
		const result = parseRemoteUrl('https://github.com/owner/repo.git');
		assert.deepStrictEqual(result, {
			scheme: 'https',
			host: 'github.com',
			port: undefined,
			path: 'owner/repo'
		});
	});

	test('parses an HTTPS GitLab remote with a custom port and nested subgroups', () => {
		const result = parseRemoteUrl('https://gitlab.internal:8443/group/sub/project.git');
		assert.deepStrictEqual(result, {
			scheme: 'https',
			host: 'gitlab.internal',
			port: 8443,
			path: 'group/sub/project'
		});
	});

	test('parses a plain HTTP remote', () => {
		const result = parseRemoteUrl('http://gitlab.internal/group/project.git');
		assert.deepStrictEqual(result, {
			scheme: 'http',
			host: 'gitlab.internal',
			port: undefined,
			path: 'group/project'
		});
	});

	test('parses an SCP-like SSH remote, forcing https and dropping any port', () => {
		const result = parseRemoteUrl('git@gitlab.com:group/sub/project.git');
		assert.deepStrictEqual(result, {
			scheme: 'https',
			host: 'gitlab.com',
			port: undefined,
			path: 'group/sub/project'
		});
	});

	test('parses an ssh:// remote, forcing https and dropping the SSH port', () => {
		const result = parseRemoteUrl('ssh://git@gitlab.internal:2222/group/project.git');
		assert.deepStrictEqual(result, {
			scheme: 'https',
			host: 'gitlab.internal',
			port: undefined,
			path: 'group/project'
		});
	});

	test('throws on an unrecognized remote URL format', () => {
		assert.throws(
			() => parseRemoteUrl('not a git url'),
			/Unrecognized git remote URL/
		);
	});
});

suite('git-provider-url: buildMrPrUrl', () => {
	test('builds a GitHub pull-request URL, preserving slashes in the branch name', () => {
		const parsed = { scheme: 'https', host: 'github.com', port: undefined, path: 'owner/repo' };
		const url = buildMrPrUrl(parsed, 'feature/add-x');
		assert.strictEqual(url, 'https://github.com/owner/repo/pull/new/feature/add-x');
	});

	test('percent-encodes special characters in the branch name for GitHub, keeping slashes literal', () => {
		const parsed = { scheme: 'https', host: 'github.com', port: undefined, path: 'owner/repo' };
		const url = buildMrPrUrl(parsed, 'feature/fix bug#123');
		assert.strictEqual(url, 'https://github.com/owner/repo/pull/new/feature/fix%20bug%23123');
	});

	test('builds a GitLab merge-request URL for gitlab.com', () => {
		const parsed = { scheme: 'https', host: 'gitlab.com', port: undefined, path: 'group/project' };
		const url = buildMrPrUrl(parsed, 'my-branch');
		assert.strictEqual(
			url,
			'https://gitlab.com/group/project/-/merge_requests/new?merge_request%5Bsource_branch%5D=my-branch'
		);
	});

	test('builds a GitLab merge-request URL for a self-hosted instance with nested subgroups and a custom port', () => {
		const parsed = { scheme: 'https', host: 'gitlab.internal', port: 8443, path: 'group/sub/project' };
		const url = buildMrPrUrl(parsed, 'my-branch');
		assert.strictEqual(
			url,
			'https://gitlab.internal:8443/group/sub/project/-/merge_requests/new?merge_request%5Bsource_branch%5D=my-branch'
		);
	});

	test('routes a GitHub remote with a mixed-case host to the GitHub builder', () => {
		const parsed = { scheme: 'https', host: 'GitHub.com', port: undefined, path: 'owner/repo' };
		const url = buildMrPrUrl(parsed, 'my-branch');
		assert.strictEqual(url, 'https://GitHub.com/owner/repo/pull/new/my-branch');
	});

	test('percent-encodes special characters in the branch name for GitLab via the query string', () => {
		const parsed = { scheme: 'https', host: 'gitlab.com', port: undefined, path: 'group/project' };
		const url = buildMrPrUrl(parsed, 'feature/fix bug#123');
		assert.strictEqual(
			url,
			'https://gitlab.com/group/project/-/merge_requests/new?merge_request%5Bsource_branch%5D=feature%2Ffix+bug%23123'
		);
	});
});
