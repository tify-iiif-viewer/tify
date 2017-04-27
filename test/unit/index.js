import Vue from 'vue';

// Mock axios
Vue.prototype.$http = {
	get() {
		return this;
	},
	then(func) {
		return func({});
	},
};

Vue.config.productionTip = false;

// Polyfill fn.bind() for PhantomJS
/* eslint-disable no-extend-native */
Function.prototype.bind = require('function-bind');

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./specs', true, /\.spec$/);
testsContext.keys().forEach(testsContext);

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
// TODO: Code coverage disabled until we figure out a way to exclude include-only SCSS files
// const srcContext = require.context('../../src', true, /^\.\/(?!main(\.js)?$)/);
// srcContext.keys().forEach(srcContext);
