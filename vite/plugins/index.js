import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy' //引入插件
import createAutoImport from './auto-import'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import json5 from '@miyaneee/rollup-plugin-json5';
const viteAppConfig = require('./vite.app.conf');


export default function createVitePlugins(viteEnv, isBuild = false) {
    const vitePlugins = [vue()]
    vitePlugins.push(createAutoImport())
    vitePlugins.push(json5())
	vitePlugins.push(createSetupExtend())
    vitePlugins.push(createSvgIcon(isBuild))
    vitePlugins.push(copy({
        // 显示日志
        verbose: true,
        hook: 'closeBundle',
        targets: [].concat(viteAppConfig.getAppConfigCopyInfo())
      }))
	isBuild && vitePlugins.push(...createCompression(viteEnv))
    return vitePlugins
}
