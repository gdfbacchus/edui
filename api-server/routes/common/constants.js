module.exports = {
  MAIN_ACCOUNT: {
    ID: "1.2.459605",
    NAME: "easy-dex"
  },
  ASSETS: {
    MAIN: {
      ID: "1.3.0",
      NAME: "BTS"
    },
    EASYDEX: {
      BTC: {
        MIN_DEPOSIT_AMOUNT: 0.01,
        ID: "1.3.3059",
        NAME: "EASYDEX.BTC",
        ONE_BITCOIN_SATS: 100000000,
        GET_RECENT_TX_IDS_LIMIT: 10,
        WALLET_TYPE: "btc",
        TABLE: {
          withdraw: "withdrawal",
          deposit: "transaction"
        }
      },
      LTC: {
        MIN_DEPOSIT_AMOUNT: 0.01,
        ID: "1.3.4301",
        NAME: "EASYDEX.LTC",
        ONE_LITECOIN_SATS: 100000000,
        GET_RECENT_TX_IDS_LIMIT: 10,
        WALLET_TYPE: "ltc",
        TABLE: {
          withdraw: "ltc_withdrawal",
          deposit: "lts_deposit"
        }
      },
      ETH: {
        MIN_DEPOSIT_AMOUNT: 0.01,
        ID: "1.3.4243",
        NAME: "EASYDEX.ETH",
        ONE_LITECOIN_SATS: 100000000,
        GET_RECENT_TX_IDS_LIMIT: 10,
        WALLET_TYPE: "eth",
        TABLE: {
          withdraw: "eth_withdrawal",
          deposit: "eth_deposit"
        }
      },
      USD: {
        MIN_DEPOSIT_AMOUNT: 100,
        ID: "1.3.3060",
        NAME: "EASYDEX.US",
        PRECISION: 100,
        GET_RECENT_TX_IDS_LIMIT: 10,
        WALLET_TYPE: "usd",
        TABLE: {
          withdraw: "fiat_withdrawal",
          deposit: "fiat_deposit"
        }
      },
      EUR: {
        MIN_DEPOSIT_AMOUNT: 100,
        ID: "1.3.3062",
        NAME: "EASYDEX.EU",
        PRECISION: 100,
        GET_RECENT_TX_IDS_LIMIT: 10,
        WALLET_TYPE: "eur",
        TABLE: {
          withdraw: "fiat_withdrawal",
          deposit: "fiat_deposit"
        }
      },
    }
  },
  LOG_ACTION_CONTEXT :{
    WITHDRAW: "Withdraw",
    DEPOSIT: "Deposit",
    GET_ADDRESS: "Get address",
    VERIFY_ADDRESS: "Verify address",
    ASSET_SETTINGS: "Asset settings",
    REQUEST: "Application Request",
    GET_LAST_TX_ID: "Get Recent TX IDs",
    GET_FIAT_VERIFIED_ACCOUNT_CURRENCIES: "Get Fiat Verified Account Currencies"
  },
  ZERORPC: {
    RECONN_ATTEMPTS: 10,
    RECONN_INTERVAL: 20000,
    CONN_ADDRESS: {
      BTC: "tcp://127.0.0.1:4242",//only for BTC
      ETH: "tcp://127.0.0.1:4245",//only for ETH
      LTC: "tcp://127.0.0.1:4242"//only for LTC
    }
  },
  BLACK_LISTED_ADDRESSES: {
    ETH: {
      "0x66Ae4E567A5E504538f2A9CE25599ED6522795CB": "0x66Ae4E567A5E504538f2A9CE25599ED6522795CB"
    },
    BTC: {
      "1EK6upJtVZyeN3Wop24YkrJPma9T9SmgLw": "1EK6upJtVZyeN3Wop24YkrJPma9T9SmgLw",
      "1JXUSKefgVADCk9pgTevh3a7s4HJzxy6iz": "1JXUSKefgVADCk9pgTevh3a7s4HJzxy6iz"
    },
    LTC: {
      "LXmtGvu8L9tiniQDVDmfhyWyvgUBpitvhE": "LXmtGvu8L9tiniQDVDmfhyWyvgUBpitvhE"
    }
  }

};

// 0.00000001 = 1 satoshi
// 1 BTC = 100 000 000 sats