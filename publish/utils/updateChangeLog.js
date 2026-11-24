const fs = require('fs')
const { jp, formatTime } = require('./index')
const pkgDir = '../../package.json'
const pkg = require(pkgDir)
const chalk = require('chalk')
const pkg_bak = JSON.stringify(pkg, null, 2)
const changelogPath = jp('../../CHANGELOG.md')
const { parseChangelog } = require('./parseChangelog')

const getPrevVer = () => parseChangelog(fs.readFileSync(changelogPath, 'utf-8').toString()).then(versions => {
  if (!versions.length) throw new Error('CHANGELOG 无法解析到版本号')
  return versions[0].version
})

const updateChangeLog = async(newVerNum, newChangeLog) => {
  let changeLog = fs.readFileSync(changelogPath, 'utf-8')
  const prevVer = await getPrevVer()
  const log = `## [${newVerNum}](${pkg.repository.url.replace(/^git\+(http.+)\.git$/, '$1')}/compare/v${prevVer}...v${newVerNum}) - ${formatTime()}\n\n${newChangeLog}`
  fs.writeFileSync(changelogPath, changeLog.replace(/(## [?0.1.1]?)/, log + '\n$1'), 'utf-8')
}


module.exports = async newVerNum => {
  if (!newVerNum) newVerNum = pkg.version
  const newMDChangeLog = fs.readFileSync(jp('../changeLog.md'), 'utf-8')
  pkg.version = newVerNum
  pkg.versionCode = pkg.versionCode + 1

  console.log(chalk.blue('new version: ') + chalk.green(newVerNum))

  fs.writeFileSync(jp(pkgDir), JSON.stringify(pkg, null, 2) + '\n', 'utf-8')

  await updateChangeLog(newVerNum, newMDChangeLog)

  return {
    pkg_bak,
  }
}

