import chalk from 'chalk';

import {
	checkTranslationFiles,
	findTranslatedStrings,
	rootDir,
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

const translatedStrings = findTranslatedStrings().map((result) => result.key);

if (!translatedStrings.length) {
	console.log('No translated strings found');
	process.exit(1);
}

translatedStrings.unshift('$language');

const options = {
	addMissing: process.argv.includes('--add'),
	removeUnused: process.argv.includes('--remove'),
	sort: process.argv.includes('--sort'),
};

const translationsDir = `${rootDir}public/translations`;
const results = checkTranslationFiles(translationsDir, translatedStrings, options);

let translationsWithIssuesCount = 0;

results.forEach((result) => {
	console.log(`${chalk.dim('file://')}${translationsDir}/${chalk.bold(result.langCode)}.json · ${result.langName}`);

	['empty', 'missing', 'unused'].forEach((type) => {
		const issues = result.issues.filter((issue) => issue.type === type);
		if (issues.length) {
			const label = chalk.bold(`${type.charAt(0).toUpperCase() + type.slice(1)} keys:`);
			console.log(wrapText(`${label} ${chalk.redBright(issues.map((issue) => issue.key).join(chalk.grey(', ')))}`));
		}
	});

	result.notes.forEach((note) => {
		console.log(chalk.cyanBright(note));
	});

	if (result.notes.length || result.issues.length) {
		translationsWithIssuesCount += 1;
	} else {
		console.log(chalk.greenBright('Shiny!'));
	}

	console.log();
});

console.log(`Checked ${results.length} languages, ${
	translationsWithIssuesCount
		? chalk.redBright(`found issues with ${translationsWithIssuesCount}.`)
		: chalk.greenBright('found no issues.')
}`);

process.exit(translationsWithIssuesCount ? 1 : 0);
