const assert = require('assert');
const {
	pickRemote,
	getRemoteUrl,
	getCurrentBranchName,
	findRepositoryByRootUri
} = require('../src/repository-resolver');

suite('repository-resolver: pickRemote', () => {
	test('prefers the remote named origin', () => {
		const remotes = [{ name: 'upstream' }, { name: 'origin' }];
		assert.strictEqual(pickRemote(remotes), remotes[1]);
	});

	test('falls back to the first remote when there is no origin', () => {
		const remotes = [{ name: 'upstream' }, { name: 'other' }];
		assert.strictEqual(pickRemote(remotes), remotes[0]);
	});

	test('returns undefined when there are no remotes', () => {
		assert.strictEqual(pickRemote([]), undefined);
	});
});

suite('repository-resolver: getRemoteUrl', () => {
	test('prefers fetchUrl', () => {
		const remote = { fetchUrl: 'https://github.com/owner/repo.git', pushUrl: 'https://x/y.git' };
		assert.strictEqual(getRemoteUrl(remote), 'https://github.com/owner/repo.git');
	});

	test('falls back to pushUrl when fetchUrl is missing', () => {
		const remote = { pushUrl: 'git@github.com:owner/repo.git' };
		assert.strictEqual(getRemoteUrl(remote), 'git@github.com:owner/repo.git');
	});

	test('returns undefined when neither URL is set', () => {
		assert.strictEqual(getRemoteUrl({}), undefined);
	});

	test('returns undefined when the remote itself is undefined', () => {
		assert.strictEqual(getRemoteUrl(undefined), undefined);
	});
});

suite('repository-resolver: getCurrentBranchName', () => {
	test('returns the branch name from HEAD', () => {
		assert.strictEqual(getCurrentBranchName({ name: 'feature/add-x' }), 'feature/add-x');
	});

	test('returns undefined for a detached HEAD', () => {
		assert.strictEqual(getCurrentBranchName({ name: undefined }), undefined);
	});

	test('returns undefined when there is no HEAD at all', () => {
		assert.strictEqual(getCurrentBranchName(undefined), undefined);
	});
});

suite('repository-resolver: findRepositoryByRootUri', () => {
	test('finds the repository whose rootUri.fsPath matches', () => {
		const repositories = [
			{ rootUri: { fsPath: '/workspace/repo-a' } },
			{ rootUri: { fsPath: '/workspace/repo-b' } }
		];
		const result = findRepositoryByRootUri(repositories, { fsPath: '/workspace/repo-b' });
		assert.strictEqual(result, repositories[1]);
	});

	test('returns undefined when no repository matches', () => {
		const repositories = [{ rootUri: { fsPath: '/workspace/repo-a' } }];
		const result = findRepositoryByRootUri(repositories, { fsPath: '/workspace/other' });
		assert.strictEqual(result, undefined);
	});
});
