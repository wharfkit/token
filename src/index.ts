import {APIClient, Asset, Name, NameType} from '@wharfkit/antelope'
import * as SystemTokenContract from './contracts/system.token'

interface TokenOptions {
    apiClient: APIClient
    systemTokenSymbol?: Asset.SymbolType
}

export class Token {
    readonly systemTokenContract: SystemTokenContract.Contract
    readonly systemTokenSymbol: Asset.SymbolType

    constructor({apiClient, systemTokenSymbol}: TokenOptions) {
        this.systemTokenContract = new SystemTokenContract.Contract({client: apiClient})
        this.systemTokenSymbol = systemTokenSymbol || '4,EOS'
    }

    async transfer(
        from: NameType,
        to: NameType,
        amount: number,
        memo = '',
        symbolType: Asset.SymbolType = this.systemTokenSymbol
    ) {
        const symbol = Asset.Symbol.from(symbolType)
        const senderBalance = await this.balance(from, symbol.code)

        // check recipient balance to make sure that it exists
        await this.balance(to, symbol.code)

        const quantity = Asset.from(amount, symbol)

        if (senderBalance.value < amount) {
            throw new Error(`Insufficient funds for ${from} to transfer ${quantity} to ${to}.`)
        }

        return this.systemTokenContract.action('transfer', {
            from: Name.from(from),
            to: Name.from(to),
            quantity,
            memo,
        })
    }

    balance(accountName: NameType, symbolCode?: Asset.SymbolCodeType): Promise<Asset> {
        return this.systemTokenContract
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
