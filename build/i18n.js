import fs from 'fs';
import path from 'path';
import url from 'url';

import chalk from 'chalk';
import * as Diff from 'diff';

export const indention = '\t';

export const rootDir = url.fileURLToPath(new URL('..', import.meta.url));

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

export function checkTranslationFiles(
	translationsDir,
	referenceKeys,
	options = { addMissing: false, removeUnused: false, sort: false },
) {
	const translationFiles = fs.readdirSync(translationsDir);

	const results = [];
	translationFiles.forEach((file) => {
		const lang = path.parse(file).name;

		const result = {
			lang,
			notes: [],
			issues: [],
		};

		const json = fs.readFileSync(`${translationsDir}/${file}`);
		const translation = JSON.parse(json);
		const keys = Object.keys(translation);

		const emptyKeys = keys.filter((key) => !translation[key]);
		result.issues.push(...emptyKeys.map((key) => ({ type: 'empty', key })));

		const missingKeys = referenceKeys.filter((key) => !keys.includes(key));
		result.issues.push(...missingKeys.map((key) => ({ type: 'missing', key })));

		const unusedKeys = keys.filter((key) => !referenceKeys.includes(key));
		result.issues.push(...unusedKeys.map((key) => ({ type: 'unused', key })));

		const keysStr = keys.join(', ');
		const referenceKeysStr = referenceKeys.join(', ');
		if (!missingKeys.length
			&& !unusedKeys.length
			&& keysStr !== referenceKeysStr
		) {
			const diffs = Diff.diffChars(keysStr, referenceKeysStr);

			const difference = diffs.map((part) => {
				if (part.added) {
					return chalk.green(part.value);
				}

				if (part.removed) {
					return chalk.red(part.value);
				}

				return part.value;
			}).join('');

			result.notes.push(`Keys are not properly sorted: ${chalk.reset(difference)}`);
		}

		results.push(result);

		if (options.addMissing && missingKeys.length) {
			missingKeys.forEach((key) => {
				translation[key] = '';
			});
			result.notes.push('Added missing keys, please add translations');
		}

		if (options.removeUnused && unusedKeys.length) {
			unusedKeys.forEach((key) => {
				delete translation[key];
			});
			result.notes.push('Removed unused keys');
		}

		const updatedTranslation = options.sort
			? sortTranslation(translation)
			: translation;

		if (options.addMissing || options.removeUnused || options.sort) {
			const updatedJson = JSON.stringify(updatedTranslation, null, indention);
			fs.writeFileSync(`${translationsDir}/${file}`, `${updatedJson}\n`);
		}
	});

	return results;
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
 * 	$translate('String');
 * 	$translate('String', 'Fallback string');
 * 	$translate(first ? 'String' : 'Other string');
 *
 * Bad examples (i.e. would not be found):
 *
 * 	$translate('String' + ' ' + 'another string');
 * 	$translate(
 * 		'String',
 * 	);
 * 	$translate(1);
 * 	$translate(
 * 		'1',
 * 		`2`,
 * 	);
 * 	$translate('',
 * 		'2',
 * 	);
 */
export function findTranslatedStrings(dir, functionName, fileName = '\\.(js|vue)$') {
	const files = fs.readdirSync(dir, { withFileTypes: true });
	const results = [];

	const translationFunctionRegexp = new RegExp(`${functionName}\\s*\\(\\s*(.*)\\s*\\)?`, 'gs');
	const fileNameRegexp = new RegExp(fileName);

	files.forEach((file) => {
		const filePath = path.join(dir, file.name);

		if (file.isDirectory()) {
			const dirResults = findTranslatedStrings(filePath, functionName);
			results.push(...dirResults);
			return;
		}

		if (!file.name.match(fileNameRegexp)) {
			return;
		}

		let lineNumber = 1;

		const fileContents = fs.readFileSync(filePath, 'utf8');

		fileContents.split('\n').forEach((line) => {
			const matches = [...line.matchAll(translationFunctionRegexp)];

			if (!matches) {
				return;
			}

			matches.forEach((match) => {
				const strings = match[1]
					.match(/'(.*?)'|"(.*?)"|`(.*?)`/g)
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
