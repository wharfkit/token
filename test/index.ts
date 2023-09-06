import 'mocha'
import {strict as assert} from 'assert'

import {APIClient, Asset} from '@wharfkit/antelope'

import {Balance} from '../src'

suite('Balance', function () {
    this.slow(20000)
    test('fetch() returns an Asset', async function () {
        // pass fetch and url to resources directly
        const balance = new Balance({
            accountName: 'eosio',
            contract: 'eosio.token',
            apiClient: new APIClient({url: 'https://eos.greymass.com'}),
        })
        // perform test
        const result = await balance.fetch()
        assert.equal(result instanceof Asset, true)
    })
})
