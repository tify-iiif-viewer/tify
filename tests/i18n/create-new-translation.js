import fs from 'fs';
import readline from 'readline';

import chalk from 'chalk';

import { findTranslatedStrings, rootDir } from './i18n-helpers.js';

const indention = '\t';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let langCode = await new Promise((resolve) => {
	rl.question('Two-letter language code (ISO 639-1): ', resolve);
});

langCode = langCode.toLowerCase();

if (!langCode.match(/^[a-z]{2}$/)) {
	console.warn(chalk.redBright('Invalid language code'));
	process.exit(1);
}

const fileName = `${rootDir}public/translations/${langCode}.json`;

if (fs.existsSync(fileName)) {
	console.warn(chalk.redBright(`${chalk.bold(fileName)} already exists`));
	process.exit(1);
}

let language = await new Promise((resolve) => {
	rl.question('Native language name: ', resolve);
});

rl.close();

language = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();

const translationObject = {
	$language: language,
};

const translatedStrings = findTranslatedStrings(`${rootDir}/src`, '\\$translate');
translatedStrings.forEach((item) => {
	translationObject[item.key] = '';
});

const json = JSON.stringify(translationObject, null, indention);

fs.writeFileSync(fileName, `${json}\n`);

console.log(`\nCreated ${chalk.dim('file://')}${chalk.bold(fileName)}`);
