import {APIClient, Asset, NameType} from '@wharfkit/antelope'

interface BalanceOptions {
    accountName: NameType
    contract: NameType
    apiClient: APIClient
    symbol?: Asset.SymbolType
}

export class Balance {
    readonly accountName: NameType
    readonly contract: NameType
    readonly symbol: Asset.SymbolType = '4,EOS'
    readonly apiClient: APIClient

    constructor({accountName, contract, symbol, apiClient}: BalanceOptions) {
        this.accountName = accountName
        this.contract = contract
        this.symbol = symbol || this.symbol
        this.apiClient = apiClient
    }

    fetch(): Promise<Asset> {
        return new Promise((resolve, reject) => {
            this.apiClient.v1.chain
                .get_currency_balance(
                    this.contract,
                    String(this.accountName),
                    this.symbol && String(this.symbol)
                )
                .then((balances) => {
                    const balance = (balances as any)[0]

                    if (!balance) {
                        reject(
                            new Error(
                                `No balance found for ${this.symbol} token of ${this.contract} contract.`
                            )
                        )
                    }

                    resolve(balance)
                })
                .catch((err) => {
                    if (
                        err.message.includes('No data') ||
                        err.message.includes('Account Query Exception')
                    ) {
                        reject(new Error(`Token contract ${this.contract} does not exist.`))
                    }
                    reject(err)
                })
        })
    }
}
