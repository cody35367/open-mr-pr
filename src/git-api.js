function getGitAPI(extensions) {
	const gitExtension = extensions.getExtension('vscode.git');
	if (!gitExtension) {
		throw new Error('The built-in Git extension (vscode.git) is not available.');
	}
	return gitExtension.exports.getAPI(1);
}

module.exports = {
	getGitAPI
};
