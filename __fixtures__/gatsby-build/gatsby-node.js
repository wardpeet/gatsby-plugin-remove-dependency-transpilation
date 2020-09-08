const { dequal } = require("dequal")

function getComparableRule(rule) {
  const value = {}
  for (const prop in rule) {
    if (typeof rule[prop] === "function") {
      value[prop] = rule[prop].toString()
    } else {
      value[prop] = rule[prop]
    }
  }

  return value
}

const hasDependencyRule = (webpackConfig, dependencyRule) => {
  const comparableDependencyRule = getComparableRule(dependencyRule)
  return webpackConfig.module.rules.some(rule => {
    const comparableRule = getComparableRule(rule)

    return dequal(comparableRule, comparableDependencyRule)
  })
}

/**
 * Gatsby detects gatsby plugin and threat them as src code
 * Problem is that the test is a nested folder of the plugin so
 * It will mark @wardpeet/async-lib as user code and transpile it anyway
 */
function removeDefaultJsRules(webpackConfig, rules) {
  // Functions aren't comparable so we convert them to a string
  const jsRule = getComparableRule(rules.js())
  const dependencyRule = getComparableRule(rules.dependencies())

  // remove dependencyRule
  webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
    const comparableRule = getComparableRule(rule)

    return (
      !dequal(comparableRule, jsRule) && !dequal(comparableRule, dependencyRule)
    )
  })

  return webpackConfig
}

exports.onCreateWebpackConfig = ({ getConfig, actions, stage, rules }) => {
  if (stage !== "build-javascript") {
    return
  }

  let webpackConfig = getConfig()
  const hasDepRule = hasDependencyRule(webpackConfig, rules.dependencies())
  console.log(hasDepRule)
  webpackConfig = removeDefaultJsRules(webpackConfig, rules)

  // add default rule back without gatsby user modules
  webpackConfig.module.rules.push(rules.js())

  if (hasDepRule) {
    webpackConfig.module.rules.push(rules.dependencies())
  }

  actions.replaceWebpackConfig(webpackConfig)
}
