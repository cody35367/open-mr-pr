function finalizeParsedUrl(scheme, host, port, rawPath) {
	const path = rawPath.replace(/\/+$/, '').replace(/\.git$/, '');
	return {
		scheme,
		host,
		port: port ? Number(port) : undefined,
		path
	};
}

function parseRemoteUrl(remoteUrl) {
	const url = remoteUrl.trim();

	let match = url.match(/^ssh:\/\/(?:[^@/]+@)?([^/:]+)(?::(\d+))?\/(.+)$/);
	if (match) {
		return finalizeParsedUrl('https', match[1], undefined, match[3]);
	}

	match = url.match(/^(https?):\/\/([^/:]+)(?::(\d+))?\/(.+)$/);
	if (match) {
		return finalizeParsedUrl(match[1], match[2], match[3], match[4]);
	}

	match = url.match(/^(?:[^@/]+@)?([^:/]+):(.+)$/);
	if (match) {
		return finalizeParsedUrl('https', match[1], undefined, match[2]);
	}

	throw new Error(`Unrecognized git remote URL: ${remoteUrl}`);
}

function encodeBranchForPath(branchName) {
	return encodeURIComponent(branchName).replace(/%2F/g, '/');
}

function buildGitHubUrl(scheme, authority, path, branchName) {
	return `${scheme}://${authority}/${path}/pull/new/${encodeBranchForPath(branchName)}`;
}

function buildGitLabUrl(scheme, authority, path, branchName) {
	const params = new URLSearchParams({ 'merge_request[source_branch]': branchName });
	return `${scheme}://${authority}/${path}/-/merge_requests/new?${params.toString()}`;
}

function buildMrPrUrl(parsed, branchName) {
	const { scheme, host, port, path } = parsed;
	const authority = port ? `${host}:${port}` : host;
	if (host.toLowerCase() === 'github.com') {
		return buildGitHubUrl(scheme, authority, path, branchName);
	}
	return buildGitLabUrl(scheme, authority, path, branchName);
}

module.exports = {
	parseRemoteUrl,
	buildMrPrUrl
};
