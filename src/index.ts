import {APIClient} from '@greymass/eosio'

import {PowerUpAPI} from './powerup'
import {REXAPI} from './rex'

interface ResourcesOptions {
    api?: APIClient
    symbol?: string
    url?: string
}

interface SampleUsage {
    cpu: number
    net: number
}

export class Resources {
    static __className = 'Resources'

    readonly api: APIClient

    // target rex weight at end of any existing transition
    rex_target_weight = Math.pow(10, 13)

    // ms per day
    mspd = 200 * 2 * 60 * 60 * 24

    // token precision/symbol
    symbol = '4,EOS'

    constructor(options: ResourcesOptions) {
        if (options.api) {
            this.api = options.api
        } else if (options.url) {
            this.api = new APIClient({url: options.url})
        } else {
            throw new Error('Missing url or api client')
        }
    }

    v1 = {
        powerup: new PowerUpAPI(this),
        rex: new REXAPI(this),
    }

    async getSampledUsage(): Promise<SampleUsage> {
        const account = await this.api.v1.chain.get_account('teamgreymass')
        return {
            cpu: account.cpu_limit.max.value / account.total_resources.cpu_weight.value / 1000,
            net: account.net_limit.max.value / account.total_resources.net_weight.value / 1000,
        }
    }
}
