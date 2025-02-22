const path = require('path');

/**
 * 应用系统配置文件路径列表(别名->路径)，
 * 别名指导入别名，如: import config from 'config';
 * 路径指相对于src/config文件夹的路径
 */
const appConfigFiles = {
  config: 'system/system.json5',
};

/**
 * 获取配置文件导入别名信息，用在webpack->resolve->alias
 */
function getAppConfigAliasInfo() {
  let aliasInfo = {};
  let isProd = process.env.NODE_ENV === 'production';
  for (let key in appConfigFiles) {
    let relativePath = appConfigFiles[key];
    let folder = relativePath.substr(0, relativePath.lastIndexOf('/'));
    aliasInfo[key] = isProd
      ? path.join(__dirname, '..', `src/config/${folder}`)
      : path.join(__dirname, '..', `src/config/${relativePath}`);
  }
  return aliasInfo;
}

/**
 * 获取配置文件打包复制信息，用在webpack->plugins->CopyWebpackPlugin
 */
function getAppConfigCopyInfo() {
  let copyInfo = [];
  for (let key in appConfigFiles) {
    let relativePath = appConfigFiles[key];
    let fileName = relativePath.substr(relativePath.lastIndexOf('/') + 1);
    copyInfo.push({
      from: path.resolve(__dirname, `../src/config/${relativePath}`),
      to: `config/${fileName}`,
    });
  }
  return copyInfo;
}

module.exports = {
  getAppConfigAliasInfo,
  getAppConfigCopyInfo,
};
