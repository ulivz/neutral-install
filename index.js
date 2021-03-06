'use strict'

const fs = require('fs')
const inquirer = require('inquirer')
const spawn = require('cross-spawn')
const chalk = require('chalk')

const YARN_LOCK = 'yarn.lock'
const NPM_LOCK = 'package-lock.json'
const PWD = process.cwd()

/**
 * Spawn synchronously
 * @param args
 * @returns {*}
 */
function exec(...args) {
  return spawn.sync(...args, { stdio: 'inherit' })
}

/**
 * Check yarn's install state
 * @returns {*}
 */
const isYarnInstalled = () => {
  const command = spawn.sync('yarn', ['--version'])
  const installed = command.stdout && command.stdout.toString().trim()
  return installed
}

const yarn = opts => {
  if (!isYarnInstalled() && !opts) {
    console.log(`\n  ${chalk.redBright('yarn')} is not found,  Please visit ${chalk.underline(chalk.yellow('https://yarnpkg.com'))} to install it first. \n`)
    return
  }
  console.log(`\n  Run ${chalk.redBright('yarn')}`)
  return exec('yarn')
}

const npm = () => {
  console.log(`\n  Run ${chalk.redBright('npm')}`)
  return exec('npm', ['install'])
}

const inquirerList = [{
  type: 'list',
  name: 'choice',
  message: `Please choose a package manager:`,
  choices: ['yarn', 'npm']
}]

/**
 * Main
 * @returns {*}
 */
module.exports = opts => {
  const pwd = opts.pwd || PWD
  if (fs.existsSync(pwd + '/' + YARN_LOCK)) {
    console.log(`\n  Find ${chalk.cyan(YARN_LOCK)}`)
    return yarn()
  }

  if (fs.existsSync(pwd + '/' + NPM_LOCK)) {
    console.log(`\n Find ${chalk.cyan(NPM_LOCK)}, run ${chalk.redBright('<npm install>')}\n`)
    return npm()
  }

  console.log()
  return (opts && opts.test ? Promise.resolve({ then: resolve => resolve({ choice: 'npm' }) }) : inquirer.prompt(inquirerList))
    .then(ob => ob.choice === 'yarn' ? yarn() : npm())
    .then(msg => msg ? (console.log(`\n  ${chalk.green('[OK]')} \n`)) : undefined)
}

module.exports.exec = exec
module.exports.isYarnInstalled = isYarnInstalled
module.exports.yarn = yarn
module.exports.npm = npm
module.exports.inquirerList = inquirerList
