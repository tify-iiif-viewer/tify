import chalk from 'chalk';

import {
	checkTranslations,
	scopes,
} from './i18n.js'; // eslint-disable-line import/extensions

function wrapText(text) {
	const words = text.split(' ');
	let line = '';
	let output = '';

	words.forEach((word) => {
		// Strip out invisible control characters
		// eslint-disable-next-line no-control-regex
		if ((line + word).replace(/\x1b\[[0-9;]*m/g, '').length > process.stdout.columns) {
			output += `${line.trimEnd()}\n`;
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

let translationsCount = 0;
let translationsWithIssuesCount = 0;

scopes.forEach((scope) => {
	console.log(chalk.cyanBright(`▶ Scope ${chalk.bold(scope.name)}\n`));

	checkTranslations({ ...scope, ...options }).forEach((result) => {
		console.log(`${chalk.dim('file://')}${result.dir}/${chalk.bold(result.langCode)}.json · ${result.langName}`);

		['empty', 'missing', 'unused'].forEach((type) => {
			const issues = result.issues.filter((issue) => issue.type === type);
			if (issues.length) {
				const label = chalk.redBright(`${type.charAt(0).toUpperCase() + type.slice(1)}:`);
				console.log(wrapText(`${label} ${chalk.red(issues.map((issue) => issue.key).join(chalk.grey(', ')))}`));
			}
		});

		result.notes.forEach((note) => {
			console.log(chalk.cyanBright(note));
		});

		translationsCount += 1;

		if (result.notes.length || result.issues.length) {
			translationsWithIssuesCount += 1;
		} else {
			console.log(chalk.greenBright('Shiny!'));
		}

		console.log();
	});
});

console.log(`Checked ${translationsCount} translations, ${
	translationsWithIssuesCount
		? chalk.redBright(`found issues with ${translationsWithIssuesCount}.`)
		: chalk.greenBright('found no issues.')
}`);

process.exit(translationsWithIssuesCount ? 1 : 0);
