const vscode = require('vscode');
const { parseRemoteUrl, buildMrPrUrl } = require('./src/git-provider-url');
const { getGitAPI } = require('./src/git-api');
const {
	pickRemote,
	getRemoteUrl,
	getCurrentBranchName,
	findRepositoryByRootUri
} = require('./src/repository-resolver');

/**
 * @param {vscode.SourceControl} sourceControl
 */
async function openMrPr(sourceControl) {
	const rootUri = sourceControl && sourceControl.rootUri;
	if (!rootUri) {
		vscode.window.showErrorMessage('open-mr-pr: Could not determine which repository to use.');
		return;
	}

	let git;
	try {
		git = getGitAPI(vscode.extensions);
	} catch (/** @type {any} */ error) {
		vscode.window.showErrorMessage(`open-mr-pr: ${error.message}`);
		return;
	}

	const repository = findRepositoryByRootUri(git.repositories, rootUri);
	if (!repository) {
		vscode.window.showErrorMessage('open-mr-pr: Could not find a matching git repository.');
		return;
	}

	const branchName = getCurrentBranchName(repository.state.HEAD);
	if (!branchName) {
		vscode.window.showErrorMessage('open-mr-pr: No branch is checked out (detached HEAD).');
		return;
	}

	const remote = pickRemote(repository.state.remotes);
	const remoteUrl = getRemoteUrl(remote);
	if (!remoteUrl) {
		vscode.window.showErrorMessage('open-mr-pr: No git remote is configured for this repository.');
		return;
	}

	let parsed;
	try {
		parsed = parseRemoteUrl(remoteUrl);
	} catch (/** @type {any} */ error) {
		vscode.window.showErrorMessage(`open-mr-pr: ${error.message}`);
		return;
	}

	const url = buildMrPrUrl(parsed, branchName);
	await vscode.env.openExternal(vscode.Uri.parse(url));
}

function activate(context) {
	const disposable = vscode.commands.registerCommand('open-mr-pr.openMrPr', openMrPr);
	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
