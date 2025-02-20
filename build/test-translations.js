import chalk from 'chalk';

import {
	checkTranslationFiles,
	findTranslatedStrings,
	rootDir,
} from './i18n.js'; // eslint-disable-line import/extensions

const translatedStrings = findTranslatedStrings(`${rootDir}/src`, '\\$translate')
	.map((result) => result.key);

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

const translationsDir = `${rootDir}public/translations`;
const results = checkTranslationFiles(translationsDir, translatedStrings, options);

let translationsWithIssuesCount = 0;

results.forEach((result) => {
	console.log(`${chalk.dim('file://')}${translationsDir}/${chalk.bold(result.lang)}.json`);

	['empty', 'missing', 'unused'].forEach((type) => {
		const issues = result.issues.filter((issue) => issue.type === type);
		const label = `${type.charAt(0).toUpperCase() + type.slice(1)} keys`;
		if (issues.length) {
			console.log(`  ${chalk.redBright(label)}`);
			console.log(`    ${chalk.red(issues.map((issue) => issue.key).join('\n    '))}`);
		}
	});

	result.notes.forEach((note) => {
		console.log(`  ${chalk.cyanBright(note)}`);
	});

	if (result.notes.length || result.issues.length) {
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
