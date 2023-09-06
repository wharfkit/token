import {strict as assert} from 'assert'

import {Asset} from '@wharfkit/antelope'
import {makeClient} from '@wharfkit/mock-data'

const apiClient = makeClient('https://jungle4.greymass.com')

import {Balance} from '../../src'

suite('Balance', function () {
    this.slow(20000)
    test('fetch() returns an Asset', async function () {
        // pass fetch and url to resources directly
        const balance = new Balance({
            accountName: 'teamgreymass',
            contract: 'eosio.token',
            apiClient,
        })
        // perform test
        const result = await balance.fetch()
        assert.equal(result instanceof Asset, true)
    })
})
