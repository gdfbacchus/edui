const GRAPHENE_100_PERCENT = 10000;
//1 satoshi = 0.00000001 BTC

export const  withdrawFees = {
    BTC: {
      minerFee: {
        DEFAULT_MINER_FEE: 0.00003000, //10 satoshi
        MIN_MINER_FEE: 0.00003000, //10 satoshi
      }
    },
    STEEM: {
      minerFee: {
        DEFAULT_MINER_FEE: 0,
        MIN_MINER_FEE: 0
      }
    },
    SBD: {
      minerFee: {
        DEFAULT_MINER_FEE: 0,
        MIN_MINER_FEE: 0
      }
    },
    ETH: {
      minerFee: {
        DEFAULT_MINER_FEE: 0.00100000,
        MIN_MINER_FEE: 0.00100000
      }
    },
    LTC: {
      minerFee: {
        DEFAULT_MINER_FEE: 0.00050000,
        MIN_MINER_FEE: 0.00050000,
      }
    },
    WLS: {
      minerFee: {
        DEFAULT_MINER_FEE: 0,
        MIN_MINER_FEE: 0
      }
    }
  };
