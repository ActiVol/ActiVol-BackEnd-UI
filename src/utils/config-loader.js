import axios from 'axios';
const JSON5 = require('json5');

const converters = {
  json: data => {
    return typeof data === 'string' ? JSON.parse(data) : data;
  },
  json5: data => {
    return JSON5.parse(data);
  },
  xml: (data, opts) => {
    let x2js = new X2JS();
    let result = x2js.xml_str2json(data);
    if (result == null) {
      throw new Error('xml格式不正确！');
    }
    if (opts.xmlRoot) {
      result = result[opts.xmlRoot];
    }
    if (opts.conclusionType) {
      result = deepNativeType(result);
    }
    return result;
  },
};

const configCaches = {};

async function readAsync(filePath) {
  let path = `${filePath}?_=${new Date().getTime()}`;
  return new Promise((resolve, reject) => {
    if (!configCaches[filePath]) {
      axios
        .get(path)
        .then(p => {
          if (p.data) {
            configCaches[filePath] = p.data;
          }
          resolve(p.data);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      resolve(configCaches[filePath]);
    }
  });
}

function readSync(filePath) {
  let path = `${filePath}?_=${new Date().getTime()}`;
  let xhr = new XMLHttpRequest();
  let data = null;
  xhr.open('GET', path, false);
  xhr.onload = () => {
    data = xhr.responseText;
    configCaches[filePath] = data;
  };
  xhr.onerror = () => {
    throw new Error(`${xhr.status}: ${xhr.statusText}`);
  };
  xhr.ontimeout = () => {
    throw new Error(`${xhr.status}: ${xhr.statusText}`);
  };
  xhr.send();
  return data;
}

async function readAndConvertAsync(filePath, opts = {}) {
  let options = Object.assign({ conclusionType: true, xmlRoot: 'root' }, opts);
  return new Promise((resolve, reject) => {
    readAsync(filePath)
      .then(async data => {
        let fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
        let parser = converters[fileExt];
        if (!parser) {
          reject('格式无法解析，未找到加载器！');
          return;
        }
        try {
          let result = parser(data, options);
          resolve(result);
        } catch (e) {
          reject(`配置文件解析失败，${e}`);
        }
      })
      .catch(e => {
        reject(`配置文件获取失败，${e}`);
      });
  });
}

function readAndConvertSync(filePath, opts = {}) {
  let options = Object.assign({ conclusionType: true, xmlRoot: 'root' }, opts);
  let data = readSync(filePath);
  let fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
  let parser = converters[fileExt];
  if (!parser) {
    throw new Error('格式无法解析，未找到加载器！');
  }
  let result = null;
  try {
    result = parser(data, options);
  } catch (e) {
    throw new Error(`配置文件解析失败，${e}`);
  }
  return result;
}

function deepNativeType(data) {
  const t = typeOf(data);
  let o;
  if (t === 'array') {
    o = [];
  } else if (t === 'object') {
    o = {};
  } else {
    return nativeType(data);
  }
  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      o.push(deepNativeType(data[i]));
    }
  } else if (t === 'object') {
    for (let i in data) {
      o[i] = deepNativeType(data[i]);
    }
  }
  return o;
}

export { readAndConvertSync };
