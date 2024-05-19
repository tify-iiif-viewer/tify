import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import * as Diff from 'diff';

export function checkTranslationFiles(translationsDir, referenceKeys) {
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

		const keysEmpty = [];
		keys.forEach((key) => {
			if (!translation[key]) {
				keysEmpty.push(key);
			}
		});
		if (keysEmpty.length) {
			result.issues.push(`Empty values\n    ${chalk.dim(keysEmpty.join('\n    '))}`);
		}

		const missingKeys = referenceKeys.filter((key) => !keys.includes(key));
		if (missingKeys.length) {
			result.issues.push(`Missing keys\n    ${chalk.dim(missingKeys.join('\n    '))}`);
		}

		const unusedKeys = keys.filter((key) => !referenceKeys.includes(key));
		if (unusedKeys.length) {
			result.issues.push(`Unused keys\n    ${chalk.dim(unusedKeys.join('\n    '))}`);
		}

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

			result.issues.push(`Keys are not properly sorted: ${chalk.reset(difference)}`);
		}

		results.push(result);
	});

	return results;
}

// This relies on all uses of the translation function being single-line, e.g. TODO
// The function params may contain ternary operators, but translated strings must never be concatenated or otherwise “built”. Only use plain strings.
// This is fine:
// $translate('String')
// $translate('String', 'Fallback string')
// $translate(first ? 'String' : 'Other string')
// This is not:
// $translate(
//   'string'
// )
// $translate((first ? 'Other ' : '') + 'string')
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
		} else if (file.name.match(fileNameRegexp)) {
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
		}
	});

	results.sort((a, b) => a.key.localeCompare(b.key));

	return results;
}
