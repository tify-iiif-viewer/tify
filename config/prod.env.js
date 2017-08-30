module.exports = {
	NODE_ENV: '"production"',
	AUTHOR_NAME: `"${process.env.npm_package_author_name}"`,
	AUTHOR_EMAIL: `"${process.env.npm_package_author_email}"`,
	BUGS_URL: `"${process.env.npm_package_bugs_url}"`,
	HOMEPAGE: `"${process.env.npm_package_homepage}"`,
	LICENSE: `"${process.env.npm_package_license}"`,
	REPOSITORY_URL: `"${process.env.npm_package_repository_url.replace(/^git\+/, '')}"`,
	VERSION: `"${process.env.npm_package_version}"`,
};
