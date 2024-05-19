import fs from 'fs';
import url from 'url';

import chalk from 'chalk';

import { checkTranslationFiles, findTranslatedStrings } from './functions.js';

const rootDir = url.fileURLToPath(new URL('../..', import.meta.url));

const translatedStrings = findTranslatedStrings(`${rootDir}/src`, '\\$translate').map((result) => result.key);

if (!translatedStrings.length) {
	console.log('No translated strings found');
	process.exit(1);
}

translatedStrings.unshift('$language');

const translationsDir = `${rootDir}public/translations`;
const results = checkTranslationFiles(translationsDir, translatedStrings);

results.forEach((result) => {
	console.log(`${chalk.dim('file://')}${translationsDir}/${chalk.bold(result.lang)}.json`);

	result.notes.forEach((note) => {
		console.log(`  ${note}`);
	});

	result.issues.forEach((issue) => {
		console.log(`  ${chalk.redBright(issue)}`);
	});

	if (!result.notes.length && !result.issues.length) {
		console.log(chalk.greenBright('  Shiny!'));
	}

	console.log();
});

const translationsWithIssuesCount = results.filter((result) => result.issues.length).length;

console.log(`Checked ${results.length} languages, ${
	translationsWithIssuesCount
		? chalk.redBright(`found issues with ${translationsWithIssuesCount}.`)
		: chalk.greenBright('found no issues.')
}`);

process.exit(translationsWithIssuesCount ? 1 : 0);
