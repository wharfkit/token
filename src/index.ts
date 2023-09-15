import {APIClient, Asset, AssetType, Name, NameType} from '@wharfkit/antelope'
import * as SystemTokenContract from './contracts/system.token'
import {Contract} from '@wharfkit/contract'

interface TokenOptions {
    client: APIClient
    tokenSymbol?: Asset.SymbolType
    contract?: Contract
}

export class Token {
    readonly contract: Contract
    readonly tokenSymbol: Asset.SymbolType

    constructor({contract, client, tokenSymbol}: TokenOptions) {
        this.contract = contract || new SystemTokenContract.Contract({client})
        this.tokenSymbol = tokenSymbol || '4,EOS'
    }

    async transfer(
        from: NameType,
        to: NameType,
        amount: number | AssetType,
        memo = '',
        symbolType: Asset.SymbolType = this.tokenSymbol
    ) {
        let quantity

        if (typeof amount === 'number') {
            quantity = Asset.from(amount, symbolType)
        } else {
            quantity = Asset.from(amount)
        }

        return this.contract.action('transfer', {
            from: Name.from(from),
            to: Name.from(to),
            quantity,
            memo,
        })
    }

    balance(accountName: NameType, symbolCode?: Asset.SymbolCodeType): Promise<Asset> {
        return this.contract
            .table('accounts', accountName)
            .all()
            .then((accountBalances) => {
                if (!accountBalances) {
                    throw new Error(`Account ${accountName} does not exist.`)
                }

                let accountBalance

                if (symbolCode) {
                    accountBalance = accountBalances.find((account) => {
                        return account.balance.symbol.code.equals(symbolCode)
                    })

                    if (!accountBalance) {
                        throw new Error(
                            `No balance found for ${accountName} with symbol ${symbolCode}.`
                        )
                    }
                } else {
                    accountBalance = accountBalances[0]

                    if (!accountBalance) {
                        throw new Error(`No balances found for ${accountName}.`)
                    }
                }

                return accountBalance?.balance
            })
            .catch((err) => {
                throw new Error(`Failed to fetch balance for ${accountName}: ${err}`)
            })
    }
}
