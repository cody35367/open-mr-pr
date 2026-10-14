function pickRemote(remotes) {
	return remotes.find((remote) => remote.name === 'origin') || remotes[0];
}

function getRemoteUrl(remote) {
	return (remote && (remote.fetchUrl || remote.pushUrl)) || undefined;
}

function getCurrentBranchName(head) {
	return (head && head.name) || undefined;
}

function findRepositoryByRootUri(repositories, rootUri) {
	return repositories.find((repo) => repo.rootUri.fsPath === rootUri.fsPath);
}

module.exports = {
	pickRemote,
	getRemoteUrl,
	getCurrentBranchName,
	findRepositoryByRootUri
};
