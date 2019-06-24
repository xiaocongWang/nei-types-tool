const jsonc2Type = require('jsonc-type').default;
const dom = require('dts-dom');
const urllib = require('urllib');
const config = require('../config/index.json');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const stream = require('stream');

// 是否包含公共资源库的分组
const includeCommonReg = /公共资源库/;

class NeiTypeTool {
    /**
     * @param {*} key nei 每个项目对应的标识
     * @param {*} options
     * includeCommon 是否包含公共资源库分组吗，默认为 false
     */
    constructor(key, options = { includeCommon: false }) {
        // nei 内每个项目的唯一标识
        this.key = key;
        if (!key) {
            throw new Error('项目唯一标识不能为空')
        }
        this.neiProjectresAPI = config.neiProjectresAPI;
        this.projectInfo = {};

        this.options = options;
    }

    async _getNeiProjectInfo() {
        const { neiProjectresAPI, key } = this;

        return new Promise(async (resolve, reject) => {
            const response = await urllib.request(`${neiProjectresAPI}?key=${key}`);
            const { status, data: buffer, message } = response;

            if (status === 200) {
                // 防止 json 内容过大，使用流的方式解析
                const bufferStream = new stream.PassThrough();
                bufferStream.push(buffer);
                bufferStream.push(null);

                const parser = JSONStream.parse([{emitKey: true}]);
                let projectInfo = {};
                bufferStream.pipe(parser).pipe(es.mapSync(res => {
                    // 过滤掉除 result 外的其他字段
                    const { key, value } = res;
                    if (key === 'result') {
                        return value;
                    }
                })).on('data', data => {
                    projectInfo = data;
                }).on('end', () => {
                    resolve(projectInfo);
                });
            } else {
                reject(new Error({ code: status, message }));
            }
        })
    }

    // http 接口信息
    get interfaces() {
        const interfaces = this.projectInfo.interfaces;

        if (this.options.includeCommon) {
            return interfaces;
        }

        // 过滤掉公共资源库
        return interfaces.filter((item) => {
            return !includeCommonReg.test(item.group.description);
        });
    }

    // rpc 接口信息
    get rpcs() {
        return this.projectInfo.rpcs;
    }

    async init(callback) {
        this.projectInfo = await this._getNeiProjectInfo();
        callback.bind(this)();
    }

    /**
     * 生成请求参数的 TS 接口
     * @param {*} name 可根据 nei 接口名称生成指定的 TS 接口
     */
    generateReqInterface(name) {

    }

    /**
     * 生成响应数据的 TS 接口
     * @param {*} name 可根据 nei 接口名称生成指定的 TS 接口
     */
    generateResInterface(name) {

    }
}

module.exports = NeiTypeTool;
