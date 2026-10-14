const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('registers the open-mr-pr.openMrPr command', async () => {
		const ext = vscode.extensions.getExtension('undefined_publisher.open-mr-pr');
		await ext.activate();
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('open-mr-pr.openMrPr'));
	});
});
