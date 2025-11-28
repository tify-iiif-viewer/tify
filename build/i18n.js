import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import chalk from 'chalk';
import * as Diff from 'diff';

const excludedStrings = ['$n/a'];
const rootDir = url.fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const translationFunctionName = '$translate';

export const indention = '\t';
export const scopes = [
	{
		name: 'Demo',
		translationsDir: `${rootDir}/src/demo/translations`,
		globPattern: `${rootDir}/src/demo/**/*.vue`,
	},
	{
		name: 'TIFY',
		translationsDir: `${rootDir}/public/translations`,
		globPattern: `${rootDir}/src/**/*.vue`,
		excludedGlobPatterns: ['**/demo'],
	},
];

function sortTranslation(translation) {
	return Object.keys(translation)
		.sort((a, b) => {
			if (a === '$language') {
				return -1;
			}

			if (b === '$language') {
				return 1;
			}

			return a.toLowerCase().localeCompare(b.toLowerCase());
		})
		.reduce((acc, key) => {
			acc[key] = translation[key];
			return acc;
		}, {});
}

/**
 * Find all proper occurrences of $translate()
 *
 * $translate() should always fit into a single line and only have single-quoted
 * strings as parameters. The function params may contain ternary operators, but
 * translated strings must never be concatenated or otherwise "built" for the
 * automated translation tests to work.
 *
 * Good examples:
 *
 * 	$translate('String')
 * 	$translate(condition ? 'String' : 'Another string')
 *
 * Bad examples (i.e. would not be found):
 *
 * 	$translate('String' + ' ' + 'another string')
 * 	$translate(
 * 		'String',
 * 	)
 * 	$translate(1);
 * 	$translate(
 * 		'1',
 * 		`2`,
 * 	)
 * 	$translate('',
 * 		'2',
 * 	)
 */
export function findTranslatedStrings(globPattern, excludedGlobPatterns = []) {
	const filePaths = fs.globSync(globPattern, { exclude: excludedGlobPatterns });
	const results = [];

	const translationFunctionRegexp = new RegExp(
		`${translationFunctionName.replace(/\$/g, '\\$')}\\s*\\(\\s*(.*)\\s*\\)?`,
		'gs',
	);

	filePaths.forEach((filePath) => {
		let lineNumber = 1;

		const fileContents = fs.readFileSync(filePath, 'utf8');

		fileContents.split('\n').forEach((line) => {
			const matches = [...line.matchAll(translationFunctionRegexp)];

			if (!matches) {
				return;
			}

			matches.forEach((match) => {
				const strings = match[1]
					.match(/'(.*?)'|"(.*?)"/g)
					?.map((string) => string.slice(1, -1)); // remove quotes

				if (!strings) {
					console.warn(chalk.redBright(
						'Found translation function, but could not determine parameters'
							+ ` in ${chalk.dim('file://')}${chalk.bold(filePath)}, line ${lineNumber}: ${chalk.bold(match[0])}\n`,
					));

					return;
				}

				if (strings.some(((string) => !string))) {
					console.warn(chalk.redBright(
						'Translation function uses an empty value'
							+ ` in ${chalk.dim('file://')}${chalk.bold(filePath)}, line ${lineNumber}: ${chalk.bold(match[0])}\n`,
					));

					return;
				}

				if (strings.every((string) => excludedStrings.includes(string))) {
					return;
				}

				const matchObject = {
					file: filePath,
					line: lineNumber,
					match: match[0],
				};

				strings.forEach((string) => {
					const index = results.findIndex((result) => result.key === string);

					if (index >= 0) {
						results[index].matches.push(matchObject);
					} else {
						results.push({
							key: string,
							matches: [matchObject],
						});
					}
				});
			});

			lineNumber += 1;
		});
	});

	results.sort((a, b) => a.key.localeCompare(b.key));

	return results;
}

export function checkTranslations(options = {
	translationsDir: `${rootDir}/public/translations`,
	globPattern: `${rootDir}/src/**/*.vue`,
	excludedGlobPatterns: [],
	addMissing: false,
	removeUnused: false,
	sort: false,
}) {
	const translatedStrings = findTranslatedStrings(
		options.globPattern,
		options.excludedGlobPatterns || [],
	).map((result) => result.key);

	if (!translatedStrings.length) {
		console.log('No translated strings found');
		return [];
	}

	translatedStrings.unshift('$language');

	const filteredReferenceKeys = translatedStrings.filter((key) => !excludedStrings.includes(key));
	const results = [];
	const translationFiles = fs.readdirSync(options.translationsDir);

	translationFiles.forEach((file) => {
		const result = {
			langCode: path.parse(file).name,
			notes: [],
			issues: [],
		};

		const json = fs.readFileSync(`${options.translationsDir}/${file}`);
		const translation = JSON.parse(json);
		const keys = Object.keys(translation).filter((key) => !excludedStrings.includes(key));

		result.langName = translation.$language;

		const emptyKeys = keys.filter((key) => !translation[key]);
		result.issues.push(...emptyKeys.map((key) => ({ type: 'empty', key })));

		const missingKeys = filteredReferenceKeys.filter((key) => !keys.includes(key));
		result.issues.push(...missingKeys.map((key) => ({ type: 'missing', key })));

		const unusedKeys = keys.filter((key) => !filteredReferenceKeys.includes(key));
		result.issues.push(...unusedKeys.map((key) => ({ type: 'unused', key })));

		const keysStr = keys.join(', ');
		const referenceKeysStr = filteredReferenceKeys.join(', ');
		if (!missingKeys.length
			&& !unusedKeys.length
			&& keysStr !== referenceKeysStr
		) {
			const diffs = Diff.diffChars(keysStr, referenceKeysStr);

			const difference = diffs.map((part) => {
				if (part.added) {
					return chalk.greenBright(part.value);
				}

				if (part.removed) {
					return chalk.redBright(part.value);
				}

				return part.value;
			}).join('');

			if (options.sort) {
				result.notes.push('Keys sorted');
			} else {
				result.issues.push({ type: 'wrong order', key: difference });
			}
		}

		if (options.addMissing && missingKeys.length) {
			missingKeys.forEach((key) => {
				translation[key] = '';
			});
			result.notes.push('Missing keys added, please add translations');
		}

		if (options.removeUnused && unusedKeys.length) {
			unusedKeys.forEach((key) => {
				delete translation[key];
			});
			result.notes.push('Unused keys removed');
		}

		const updatedTranslation = options.sort
			? sortTranslation(translation)
			: translation;

		if (options.addMissing || options.removeUnused || options.sort) {
			const updatedJson = JSON.stringify(updatedTranslation, null, indention);
			fs.writeFileSync(`${options.translationsDir}/${file}`, `${updatedJson}\n`);
		}

		results.push(result);
	});

	return results;
}
