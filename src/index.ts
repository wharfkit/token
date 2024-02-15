import {APIClient, Asset, AssetType, Name, NameType} from '@wharfkit/antelope'
import * as SystemTokenContract from './contracts/system.token'
import {Contract, ContractKit} from '@wharfkit/contract'
import {makeClient} from '@wharfkit/mock-data'

interface TokenOptions {
    client: APIClient
    tokenSymbol?: Asset.SymbolType
    contract?: Contract
}

const contractKit = new ContractKit({
    client: makeClient('https://eos.greymass.com'),
})

export class Token {
    readonly contract: Contract

    constructor({contract, client}: TokenOptions) {
        this.contract = contract || new SystemTokenContract.Contract({client})
    }

    async transfer(from: NameType, to: NameType, amount: AssetType, memo = '') {
        const quantity = Asset.from(amount)

        return this.contract.action('transfer', {
            from: Name.from(from),
            to: Name.from(to),
            quantity,
            memo,
        })
    }

    async balance(
        accountName: NameType,
        symbolCode?: Asset.SymbolCodeType,
        contractName?: NameType
    ): Promise<Asset> {
        const contract = contractName ? await contractKit.load(contractName) : this.contract
        const table = contract.table('accounts', accountName)

        let tableQuery

        if (symbolCode) {
            tableQuery = table.get(String(symbolCode), {index_position: 'primary'})
        } else {
            tableQuery = table.get()
        }

        return tableQuery
            .then((accountBalance) => {
                if (!accountBalance) {
                    throw new Error(`Account ${accountName} does not exist.`)
                }

                if (symbolCode && !accountBalance.balance.symbol.code.equals(symbolCode)) {
                    throw new Error(`Symbol '${symbolCode}' does not exist.`)
                }

                return accountBalance?.balance
            })
            .catch((err) => {
                throw new Error(`Failed to fetch balance for ${accountName}: ${err}`)
            })
    }
}
