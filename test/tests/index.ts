import {strict as assert} from 'assert'

import {Asset} from '@wharfkit/antelope'
import {makeClient} from '@wharfkit/mock-data'

const apiClient = makeClient('https://jungle4.greymass.com')

import {Token} from '../../src'

suite('Token', function () {
    this.slow(20000)

    suite('balance()', function () {
        test('returns the system token balance of an account when no symbol code is passed', async function () {
            const balance = new Token({
                apiClient,
            })
            const result = await balance.balance('teamgreymass')
            assert.equal(result instanceof Asset, true)
            assert.equal(String(result.symbol.code), 'EOS')
        })

        test('returns the balance of an account for a specific symbol', async function () {
            const balance = new Token({
                apiClient,
            })
            const result = await balance.balance('teamgreymass', 'EOS')
            assert.equal(result instanceof Asset, true)
            assert.equal(String(result.symbol.code), 'EOS')
        })

        test('throws an error when the account does not exist', async function () {
            const balance = new Token({
                apiClient,
            })
            await assert.rejects(() => balance.balance('notanaccount'))
        })

        test('throws an error when the symbol does not exist', async function () {
            const balance = new Token({
                apiClient,
            })
            await assert.rejects(() => balance.balance('teamgreymass', 'NOT'))
        })
    })
})
