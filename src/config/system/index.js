import { Message} from 'element-ui'

import { readAndConvertSync } from '../../utils/config-loader';

//应用程序配置
let config;
try {
  config = readAndConvertSync('config/system.json5');
} catch (e) {
  Message.error(e);
}

export default config;
