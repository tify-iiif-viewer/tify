import chalk from 'chalk';

import {
	checkTranslations,
	scopes,
} from './i18n.js'; // eslint-disable-line import/extensions

function groupByLangCode(source) {
	const byLang = new Map();

	Object.entries(source).forEach(([scopeName, items]) => {
		items.forEach((item) => {
			const { langCode, langName, ...scope } = item;

			if (!byLang.has(langCode)) {
				byLang.set(langCode, { langCode, langName });
			}

			const target = byLang.get(langCode);
			target.scopes ??= [];
			scope.name = scopeName;
			target.scopes.push(scope);
		});
	});

	return Array.from(byLang.values());
}

function wrapText(text, indent = 0) {
	const words = text.split(' ');
	let line = '';
	let output = '';

	words.forEach((word) => {
		// Strip out invisible control characters
		// eslint-disable-next-line no-control-regex
		if ((line + word).replace(/\x1b\[[0-9;]*m/g, '').length > (process.stdout.columns - indent)) {
			output += `${line.trimEnd()}\n${' '.repeat(indent)}`;
			line = '';
		}

		line += `${word} `;
	});

	output += line.trimEnd();
	return output;
}

const options = {
	addMissing: process.argv.includes('--add'),
	removeUnused: process.argv.includes('--remove'),
	sort: process.argv.includes('--sort'),
};

const results = {};
scopes.forEach((scope) => {
	results[scope.name] = checkTranslations({ ...scope, ...options });
});

const groupedResults = groupByLangCode(results);

groupedResults.forEach((result) => {
	console.log(chalk.bgBlue(` ${chalk.bold(result.langCode.toUpperCase())} · ${result.langName} `));
	console.log();

	scopes.forEach((scope) => {
		const filePath = `${scope.translationsDir}/${result.langCode}.json`;
		const resultScope = result.scopes.find((item) => item.name === scope.name);

		const icon = !resultScope || resultScope.notes.length + resultScope.issues.length > 0
			? chalk.redBright('✖')
			: chalk.greenBright('✔');

		if (!resultScope) {
			console.log(`${icon} ${scope.name}: ${chalk.redBright(`file ${filePath} not found`)}`);
			console.log();
			return;
		}

		console.log(`${icon} ${resultScope.name}: ${chalk.dim('file://')}${filePath}`);

		const issueTypes = new Set(resultScope.issues.map((issue) => issue.type));
		issueTypes.forEach((type) => {
			const issues = resultScope.issues.filter((issue) => issue.type === type);
			if (issues.length) {
				console.log();
				const label = chalk.redBright(`${type.charAt(0).toUpperCase() + type.slice(1)}:`);
				console.log(wrapText(`  ${label} ${chalk.dim(issues.map((issue) => issue.key).join(', '))}`, 2));
			}
		});

		resultScope.notes.forEach((note) => {
			console.log();
			console.log(chalk.cyanBright(`  ${note}`));
		});

		console.log();
	});
});

const langaugesWithIssuesCount = groupedResults
	.filter((result) => result.scopes.length !== scopes.length
		|| result.scopes.some((scope) => scope.notes.length + scope.issues.length > 1)).length;
console.log(`Checked ${groupedResults.length} langauges, ${
	langaugesWithIssuesCount
		? chalk.bgRed(` found issues with ${langaugesWithIssuesCount} `)
		: chalk.bgGreen(' found no issues ')
}`);

process.exit(langaugesWithIssuesCount ? 1 : 0);
