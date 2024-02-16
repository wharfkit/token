import {strict as assert} from 'assert'

import {Asset} from '@wharfkit/antelope'
import {makeClient} from '@wharfkit/mock-data'

const apiClient = makeClient('https://eos.greymass.com')

import {Token} from '../../src'

suite('Token', function () {
    const token = new Token({
        client: apiClient,
    })

    this.slow(20000)

    suite('balance()', function () {
        test('returns the system token balance of an account when no symbol code is passed', async function () {
            const result = await token.balance('teamgreymass')
            assert.equal(result instanceof Asset, true)
            assert.equal(String(result.symbol.code), 'EOS')
        })

        test('returns the balance of an account for a specific symbol', async function () {
            const result = await token.balance('teamgreymass', 'EOS')
            assert.equal(result instanceof Asset, true)
            assert.equal(String(result.symbol.code), 'EOS')
        })

        test('returns the balance of an account for a specific symbol and contract', async function () {
            const result = await token.balance('teamgreymass', 'USDT', 'tethertether')

            assert.equal(result instanceof Asset, true)
            assert.equal(String(result.symbol.code), 'USDT')
        })

        test('throws an error when the account does not exist', async function () {
            await assert.rejects(
                () => token.balance('notanaccount'),
                "Account 'notanaccount' does not exist."
            )
        })

        test('throws an error when the symbol does not exist', async function () {
            await assert.rejects(
                () => token.balance('teamgreymass', 'NOT'),
                "Symbol 'NOT' does not exist."
            )
        })
    })

    suite('transfer()', function () {
        test('creates a transfer action', async function () {
            const action = await token.transfer(
                'teamgreymass',
                'teamgreymass',
                '1.3200 EOS',
                'this is a test'
            )

            assert.equal(String(action.account), 'eosio.token')
            assert.equal(String(action.name), 'transfer')
            assert.equal(
                action.data.hexString,
                '80b1915e5d268dca80b1915e5d268dca903300000000000004454f53000000000e7468697320697320612074657374'
            )
        })
    })
})
