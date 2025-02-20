import fs from 'fs';
import readline from 'readline';

import chalk from 'chalk';

import {
	findTranslatedStrings,
	indention,
	rootDir,
} from './i18n.js'; // eslint-disable-line import/extensions

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const langCode = (await new Promise((resolve) => {
	rl.question('Two-letter language code (ISO 639-1): ', resolve);
})).toLowerCase();

if (!langCode.match(/^[a-z]{2}$/)) {
	console.warn(chalk.redBright('Invalid language code'));
	process.exit(1);
}

const fileName = `${rootDir}public/translations/${langCode}.json`;

if (fs.existsSync(fileName)) {
	console.warn(chalk.redBright(`${chalk.bold(fileName)} already exists`));
	process.exit(1);
}

const language = await new Promise((resolve) => {
	rl.question('Native language name: ', resolve);
});

rl.close();

const translationObject = {
	$language: language,
};

findTranslatedStrings(`${rootDir}/src`, '\\$translate').forEach((item) => {
	translationObject[item.key] = '';
});

const json = JSON.stringify(translationObject, null, indention);

fs.writeFileSync(fileName, `${json}\n`);

console.log(`\nCreated ${chalk.dim('file://')}${chalk.bold(fileName)}`);
