const fs = require('fs');
const { exec } = require('child_process');

const tag = process.argv[2];
const url = 'https://github.com/openseadragon/openseadragon.git';

process.cwd(`${__dirname}/..`);

if (!fs.existsSync('openseadragon')) {
	exec(`git clone ${url} && cd openseadragon && git checkout tags/${tag}`, (error) => {
		if (error) {
			console.log(error.message);
		}
	});
} else {
	exec('cd openseadragon; git describe --tags', (error, stdout) => {
		if (error) {
			console.log(error.message);
			return;
		}

		if (stdout === tag) {
			return;
		}

		exec(`cd openseadragon && git checkout master -f && git pull && git checkout tags/${tag}`, (error2) => {
			if (error2) {
				console.log(error2.message);
			}
		});
	});
}
