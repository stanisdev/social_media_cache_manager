'use strict';

const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(file => !file.endsWith('index.js'));
const entities = {};

files.forEach(file => {
  const name = file.slice(0, -3).toLowerCase();
  const Entity = require(`./${file}`);

  entities[name] = new Entity();
});

module.exports = entities;