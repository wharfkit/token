import {Action, APIClient, Asset, AssetType, Name, NameType} from '@wharfkit/antelope'
import {Contract, ContractKit} from '@wharfkit/contract'

interface TokenOptions {
    client: APIClient
    contract?: Contract
}

export class Token {
    client: APIClient
    contractKit: ContractKit
    contract?: Contract

    constructor({client, contract}: TokenOptions) {
        this.client = client
        this.contract = contract
        this.contractKit = new ContractKit({
            client: client as any,
        })
    }

    async getContract(contractName?: string) {
        if (contractName) {
            return this.contractKit.load(contractName)
        }
        return this.contract || this.contractKit.load('eosio.token')
    }

    async transfer(from: NameType, to: NameType, amount: AssetType, memo = ''): Promise<Action> {
        const quantity = Asset.from(amount)

        const contract = await this.getContract()

        return contract.action('transfer', {
            from: Name.from(from),
            to: Name.from(to),
            quantity,
            memo,
        })
    }

    async balance(
        accountName: string,
        symbolCode?: Asset.SymbolCodeType,
        contractName?: string
    ): Promise<Asset> {
        const contract = await this.getContract(contractName)
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
