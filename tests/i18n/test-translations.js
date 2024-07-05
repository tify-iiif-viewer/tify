import chalk from 'chalk';

import { checkTranslationFiles, findTranslatedStrings, rootDir } from './i18n-helpers.js';

const translatedStrings = findTranslatedStrings(`${rootDir}/src`, '\\$translate').map((result) => result.key);

if (!translatedStrings.length) {
	console.log('No translated strings found');
	process.exit(1);
}

// TODO: Alert on missing language name
translatedStrings.unshift('$language');

const options = {
	addMissing: process.argv.includes('--add'),
	removeUnused: process.argv.includes('--remove'),
	sort: process.argv.includes('--sort'),
};

// TODO: Add option to add missing keys and to remove unused keys

const translationsDir = `${rootDir}public/translations`;
const results = checkTranslationFiles(translationsDir, translatedStrings, options);

let translationsWithIssuesCount = 0;

results.forEach((result) => {
	console.log(`${chalk.dim('file://')}${translationsDir}/${chalk.bold(result.lang)}.json`);

	if (result.issues.empty.length) {
		console.log(`  ${chalk.redBright('Empty keys')}`);
		console.log(`    ${chalk.red(result.issues.empty.join('\n    '))}`);
	}

	if (result.issues.missing.length) {
		console.log(`  ${chalk.redBright('Missing keys')}`);
		console.log(`    ${chalk.red(result.issues.missing.join('\n    '))}`);
	}

	if (result.issues.unused.length) {
		console.log(`  ${chalk.redBright('Unused keys')}`);
		console.log(`    ${chalk.red(result.issues.unused.join('\n    '))}`);
	}

	result.notes.forEach((note) => {
		console.log(`  ${chalk.cyanBright(note)}`);
	});

	const allIssues = [...result.issues.empty, ...result.issues.missing, ...result.issues.unused];
	if (result.notes.length || allIssues.length) {
		translationsWithIssuesCount += 1;
	} else {
		console.log(chalk.greenBright('  Shiny!'));
	}

	console.log();
});

console.log(`Checked ${results.length} languages, ${
	translationsWithIssuesCount
		? chalk.redBright(`found issues with ${translationsWithIssuesCount}.`)
		: chalk.greenBright('found no issues.')
}`);

process.exit(translationsWithIssuesCount ? 1 : 0);
