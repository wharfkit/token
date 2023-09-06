import {APIClient, Asset, Name, NameType} from '@wharfkit/antelope'

interface BalanceOptions {
    accountName: NameType
    contract: NameType
    apiClient: APIClient
    symbol?: Asset.SymbolType
}

export class Balance {
    readonly accountName: Name
    readonly contract: Name
    readonly symbol: Asset.Symbol
    readonly apiClient: APIClient

    constructor({accountName, contract, symbol, apiClient}: BalanceOptions) {
        this.accountName = Name.from(accountName)
        this.contract = Name.from(contract)
        this.symbol = Asset.Symbol.from(symbol || '4,EOS')
        this.apiClient = apiClient
    }

    get symbolCode(): Asset.SymbolCode {
        return this.symbol.code
    }

    fetch(): Promise<Asset> {
        return new Promise((resolve, reject) => {
            this.apiClient.v1.chain
                .get_currency_balance(
                    String(this.contract),
                    String(this.accountName),
                    String(this.symbolCode)
                )
                .then((balances) => {
                    const balance = (balances as any)[0]

                    if (!balance) {
                        reject(
                            new Error(
                                `No "${this.symbol.code}" balance found for "${this.accountName}" token on "${this.contract}" contract.`
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
