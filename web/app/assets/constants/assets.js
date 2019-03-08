export const hiddenMemoAssetIds = ["1.3.3059","1.3.4301"]; //Hide memo in confirmation pop-up window[BTC,LTC]

export const easydexAssetSettings = {
  "1.3.3059":{
    name:"EASYDEX.BTC",
    hasFee: true,
    feeType: "miner",
    displayMemoField: false,
    pointPrecision: 8,
    disableGateFeeField: false,
    backingCoinType:"BTC",
    validateAddress: true,
    unitParts: 100000000
  },
  "1.3.3864": {
    name:"EASYDEX.STEEM",
    hasFee: false,
    feeType: "gate",
    displayMemoField: true,
    pointPrecision: 3,
    disableGateFeeField: true,
    backingCoinType:"STEEM",
    validateAddress: false,
    unitParts: 1000
  },
  "1.3.4045":{
    name:"EASYDEX.SBD",
    hasFee: false,
    feeType: "gate",
    displayMemoField: true,
    pointPrecision: 3,
    disableGateFeeField: true,
    backingCoinType:"SBD",
    validateAddress: false,
    unitParts: 1000
  },
  "1.3.4559": {
    name:"EASYDEX.WLS",
    hasFee: false,
    feeType: "gate",
    displayMemoField: true,
    pointPrecision: 3,
    disableGateFeeField: true,
    backingCoinType:"WLS",
    validateAddress: false,
    unitParts: 1000
  }
};

export const customValidations = {
  BTS: {},
  BTC: {},
  STEMM: {},
  SBD: {},
  WLS: {},
  ETH: {
    addressValidation: "^0x[a-fA-F0-9]{40}$"
  },
  LTC: {}
};

