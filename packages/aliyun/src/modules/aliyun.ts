
import { 
    envConfig, 
    IProxyConfigs,
} from './config'

const { proxy } = envConfig

export const urlProxies = createProxy(proxy)

function createProxy(config: IProxyConfigs) {
    const httpProxy = {} as any
    const apiProxy = {} as any
    for (const from of Object.keys(config)) {
        const conf = config[from]
        if (typeof conf !== 'object') {
            continue
        }
        const { to, target } = conf
        if (target.startsWith('api://')) {
            const serviceName = target.replace('api://', '')
            apiProxy[serviceName] = { from, to }
            continue
        }

        httpProxy[`^${from}`] = {
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^${from}`]: to,
            }
        }
    } 
    return { httpProxy, apiProxy }
}
