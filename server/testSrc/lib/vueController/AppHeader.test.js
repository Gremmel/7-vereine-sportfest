/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
'use strict';

const path = require('path');

// eslint-disable-next-line no-underscore-dangle
global.__extdir = path.join(__dirname, '..', '..', 'testExtern');

const obj = require(path.join(__dirname, '..', '..', '..', 'lib', 'vueController', 'AppHeader'));

// eslint-disable-next-line no-unused-vars
const wait = function (ms) {
  return new Promise((res) => setTimeout(res, ms));
};

describe('AppHeader.js', () => {
  it('example test', async () => {
    expect(obj.initFinished).toBeFalse();
  });
});
