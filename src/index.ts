import {APIClient, Asset, Name, NameType} from '@wharfkit/antelope'
import * as SystemTokenContract from './contracts/system.token'

interface BalanceOptions {
    apiClient: APIClient
}

export class Token {
    readonly systemTokenContract: SystemTokenContract.Contract

    constructor({apiClient}: BalanceOptions) {
        this.systemTokenContract = new SystemTokenContract.Contract({client: apiClient})
    }

    balance(accountName: NameType, symbolCode?: Asset.SymbolCodeType): Promise<Asset> {
        return this.systemTokenContract
            .table('accounts', accountName)
            .all()
            .then((accountBalances) => {
                let accountBalance

                if (symbolCode) {
                    accountBalance = accountBalances.find((account) =>
                        account.balance.symbol.code.equals(symbolCode)
                    )

                    if (!accountBalance) {
                        throw new Error(
                            `No balance found for ${accountName} with symbol ${symbolCode}.`
                        )
                    }
                } else {
                    accountBalance = accountBalances?.[0]

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
