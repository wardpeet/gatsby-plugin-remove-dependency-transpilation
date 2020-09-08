const { dequal } = require('dequal');

function getComparableRule(rule) {
  const value = {};
  for (const prop in rule) {
    if (typeof rule[prop] === 'function') {
      value[prop] = rule[prop].toString();
    } else {
      value[prop] = rule[prop];
    }
  }

  return value;
}

exports.onCreateWebpackConfig = ({ getConfig, actions, stage, rules }) => {
  if (stage !== 'build-javascript') {
    return;
  }

  const webpackConfig = getConfig();

  // Functions aren't comparable so we convert them to a string
  const dependencyRule = getComparableRule(rules.dependencies());

  // remove dependencyRule
  webpackConfig.module.rules = webpackConfig.module.rules.filter((rule) => {
    const comparableRule = getComparableRule(rule);

    return !dequal(comparableRule, dependencyRule);
  });

  actions.replaceWebpackConfig(webpackConfig);
};
