
function server_set(type) {

    if (type == "urls") {
        return [
          /*{url: "wss://fake.automatic-selection.com", location: "Choose closest automatically"},
          {url: "wss://kc-us-dex.xeldal.com/ws", location: "Kansas City, USA"},
          {url: "wss://fake.automatic-selection.com", location: "Choose closest automatically"},
          {url: "wss://api.bts.network", location: "East Coast, USA"},
          {url: "wss://dexnode.net/ws", location: "Dallas, USA"},
          {url: "wss://la.dexnode.net/ws", location: "LA, USA"},
          {url: "wss://api.bts.mobi/ws", location: "VA, USA"},
          {url: "wss://api.btsxchng.com", location: "Global (Asia Pacific (Singapore) / US East (N. Virginia) / EU (London))"},
          {url: "wss://us.nodes.bitshares.ws",location: "U.S. West Coast - BitShares Infrastructure Program"},
          {url: "wss://bts-api.lafona.net/ws", location: "USA"},
          {url: "wss://blockzms.xyz/ws", location: "USA"},
          {url: "wss://dex.rnglab.org", location: "Netherlands"}, */
          {url: "wss://api.bts.blckchnd.com", location: "Falkenstein, Germany"},
          {url: "wss://node.market.rudex.org", location: "Germany"},
          //{url: "wss://bitshares.crypto.fans/ws", location: "Munich, Germany"},
          //{url: "wss://bts.proxyhosts.info/wss", location: "Germany"},
          //{url: "wss://bitshares.nu/ws", location: "Stockholm, Sweden"},
          {url: "wss://api-ru.bts.blckchnd.com", location: "Moscow, Russia"},
          //{url: "wss://btsws.roelandp.nl/ws", location: "Finland"},
          //{url: "wss://eu.nodes.bitshares.ws", location: "Central Europe - BitShares Infrastructure Program"},
         // {url: "wss://api.bitshares.bhuz.info/ws", location: "Europe"},
          //{url: "wss://btsza.co.za:8091/ws", location: "Cape Town, South Africa"},
          //{url: "wss://japan.bitshares.apasia.tech/ws", location: "Tokyo, Japan"},
          //{url: "wss://ws.gdex.io", location: "Japan"},
          //{url: "wss://ws.hellobts.com/", location: "Japan"},
          //{url: "wss://bts-seoul.clockwork.gr/", location: "Seoul, Korea"},
          {url: "wss://bitshares.apasia.tech/ws", location: "Bangkok, Thailand"},
          //{url: "wss://api.btsgo.net/ws", location: "Singapore"},
          //{url: "wss://kimziv.com/ws", location: "Singapore"},
          //{url: "wss://sg.nodes.bitshares.ws",location: "Singapore - BitShares Infrastructure Program"},
          //{url: "wss://ws.winex.pro", location: "Singapore"},
          //{url: "wss://node.btscharts.com/ws", location: "Hong Kong"},
          //{url: "wss://bitshares.cyberit.io/", location: "Hong Kong"},
          //{url: "wss://bit.btsabc.org/ws", location: "Hong Kong"},
          //{url: "wss://bitshares.dacplay.org/ws", location: "Hangzhou, China"},
          //{url: "wss://bitshares-api.wancloud.io/ws", location: "China"},
          //{url: "wss://ws.gdex.top", location: "China"},
          //{url: "wss://bitshares.bts123.cc:15138/", location: "China"},
          //{url: "wss://api.bts.ai/", location: "Beijing, China"},
          //{url: "wss://freedom.bts123.cc:15138/", location: "China"},
          //{url: "wss://crazybit.online", location: "China"},
          //{url: "wss://bts.open.icowallet.net/ws", location: "Hangzhou, China"},
          //{url: "wss://bts.to0l.cn:4443/ws", location: "China"},
          //{url: "wss://fake.automatic-selection.com", location: "Choose closest automatically"},
          {url: "wss://chicago.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - Chicago"},
          {url: "wss://netherlands.bitshares.apasia.tech/ws", location: "Northern Europe - Netherlands - Amsterdam"},
          {url: "wss://france.bitshares.apasia.tech/ws", location: "Western Europe - France - Paris"},
          {url: "wss://status200.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - New Jersey"},
          {url: "wss://new-york.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - New York"},
          {url: "wss://atlanta.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - Atlanta"},
          {url: "wss://miami.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - Miami"},
          {url: "wss://dallas.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - Dallas"},
          {url: "wss://seattle.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - Seattle"},
          {url: "wss://valley.bitshares.apasia.tech/ws", location: "Northern America - U.S.A. - Silicone Valley"},
          {url: "wss://japan.bitshares.apasia.tech/ws", location: "Southeastern Asia - Japan - Tokyo"},

            
          // Testnet
          {
            url: "wss://node.testnet.bitshares.eu", location: "TESTNET - BitShares Europe (Frankfurt, Germany)"
          },
          {
            url: "wss://testnet.nodes.bitshares.ws", location: "TESTNET - BitShares Infrastructure Program"
          }
        ];
    }

    // if (type == "apiServer") {
    //   return "wss://api.bts.blckchnd.com";
    // }

    if (type == "faucet_address") {
      return "https://faucet.bitshares.eu/onboarding"; // https://faucet.testnet.bitshares.eu
    }

}


export const blockTradesAPIs = {
    BASE: "https://api.blocktrades.us/v2",
    // BASE_OL: "https://api.blocktrades.us/ol/v2",
    BASE_OL: "https://ol-api1.openledger.info/api/v0/ol/support",
    COINS_LIST: "/coins",

    ACTIVE_WALLETS: "/active-wallets",
    TRADING_PAIRS: "/trading-pairs",
    DEPOSIT_LIMIT: "/deposit-limits",
    ESTIMATE_OUTPUT: "/estimate-output-amount"
};

export const settingsAPIs = {
    // DEFAULT_WS_NODE: server_set("apiServer"),
    DEFAULT_WS_NODE: "wss://fake.automatic-selection.com",
    WS_NODE_LIST: server_set("urls"),
    DEFAULT_FAUCET: server_set("faucet_address"),
    //RPC_URL: "https://openledger.info/api/",
    RPC_URL: "",
    OPENLEDGER_FACET_REGISTR: "https://faucet.bitshares.eu/onboarding"
};

 export const airbitzAPIs = {
 apiKey: '16778e725f182af208990a71cbec917a0d16d572',
 walletType: 'wallet:repo:openledger',
 appId: 'openledger.application',
 bundlePath: 'abcui',
 vendorName: 'OpenLedger',
 vendorImageUrl: 'https://openledger.io/app/assets/logo.png',
 };
