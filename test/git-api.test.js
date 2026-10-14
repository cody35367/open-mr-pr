const assert = require('assert');
const { getGitAPI } = require('../src/git-api');

suite('git-api: getGitAPI', () => {
	test('returns the Git API when the vscode.git extension is present', () => {
		const api = {};
		const extensions = {
			getExtension: (id) => (id === 'vscode.git' ? { exports: { getAPI: () => api } } : undefined)
		};
		assert.strictEqual(getGitAPI(extensions), api);
	});

	test('throws a clear error when the vscode.git extension is not available', () => {
		const extensions = { getExtension: () => undefined };
		assert.throws(
			() => getGitAPI(extensions),
			/vscode\.git.*not available/
		);
	});
});
