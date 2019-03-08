import {Apis, Manager} from "bitsharesjs-ws";
import {ChainStore} from "bitsharesjs/es";

// Stores
import iDB from "idb-instance";
import AccountRefsStore from "stores/AccountRefsStore";
import WalletManagerStore from "stores/WalletManagerStore";
import WalletDb from "stores/WalletDb";
import SettingsStore from "stores/SettingsStore";

import ls from "common/localStorage";
const STORAGE_KEY = "__graphene__";
const ss = new ls(STORAGE_KEY);
//let apiLatencies = ss.get("apiLatencies", {});
const apiLatencies = ss.get("apiLatencies", {});
const latencyChecks = ss.get("latencyChecks", 1);
let apiLatenciesCount = Object.keys(apiLatencies).length;
// Actions
import PrivateKeyActions from "actions/PrivateKeyActions";
import SettingsActions from "actions/SettingsActions";

ChainStore.setDispatchFrequency(20);

let connect = true;
let connectionManager;

const filterAndSortURLs = (count, latencies) => {
    let urls = SettingsStore.getState().defaults.apiServer
    .filter(a => {
        /*
        * Since we don't want users accidentally connecting to the testnet,
        * we filter out the testnet address from the fallback list
        */
        if (!__TESTNET__ && a.url.indexOf("testnet") !== -1) return false;
        /* Also remove the automatic fallback dummy url */
        if (a.url.indexOf("fake.automatic-selection") !== -1) return false;
        /* Use all the remaining urls if count = 0 */
        if (!count) return true;

        /* Only keep the nodes we were able to connect to */
        return !!latencies[a.url];
    })
    .sort((a, b) => {
        return latencies[a.url] - latencies[b.url];
    }).map(a => a.url);
    return urls;
};

const willTransitionTo = (nextState, replaceState, callback) => {
    if (connect) ss.set("latencyChecks", latencyChecks + 1); // Every 15 connect attempts we refresh the api latency list
    if (latencyChecks >= 15) {
        apiLatenciesCount = 0;
        ss.set("latencyChecks", 0);
    }
    // apiLatencies = {
    //   "wss://eu.nodes.bitshares.ws": 254,
    //   "wss://node.market.rudex.org": 256,
    //   "wss://api.bts.blckchnd.com": 257,
    //   "wss://bts.proxyhosts.info/wss": 257,
    //   "wss://dex.rnglab.org": 261,
    //   "wss://bitshares.crypto.fans/ws": 264,
    //   "wss://btsws.roelandp.nl/ws": 299,
    //   "wss://api-ru.bts.blckchnd.com": 310,
    //   "wss://api.btsxchng.com": 313,
    //   "wss://bitshares.nu/ws": 378,
    //   "wss://bts-api.lafona.net/ws": 532,
    //   "wss://api.bts.mobi/ws": 542,
    //   "wss://api.bitshares.bhuz.info/ws": 591,
    //   "wss://dexnode.net/ws": 639,
    //   "wss://kc-us-dex.xeldal.com/ws": 660,
    //   "wss://la.dexnode.net/ws": 768,
    //   "wss://sg.nodes.bitshares.ws": 806,
    //   "wss://kimziv.com/ws": 885,
    //   "wss://api.bts.ai/": 911,
    //   "wss://node.btscharts.com/ws": 1084,
    //   "wss://bitshares-api.wancloud.io/ws": 1140,
    //   "wss://api.btsgo.net/ws": 1214,
    //   "wss://bts.to0l.cn:4443/ws": 1251,
    //   "wss://ws.gdex.io": 1276,
    //   "wss://bitshares.dacplay.org/ws": 1286,
    //   "wss://ws.hellobts.com/": 1289,
    //   "wss://ws.gdex.top": 1290,
    //   "wss://bts.open.icowallet.net/ws": 1293,
    //   "wss://bts-seoul.clockwork.gr/": 1327,
    //   "wss://crazybit.online": 1375,
    //   "wss://bitshares.cyberit.io/": 1390,
    //   "wss://bit.btsabc.org/ws": 1404,
    //   "wss://blockzms.xyz/ws": 1598,
    //   "wss://ws.winex.pro": 1783,
    //   "wss://bitshares.bts123.cc:15138/": 1868,
    //   "wss://us.nodes.bitshares.ws": 2219,
    //   "wss://freedom.bts123.cc:15138/": 4000
    // }
    let urls = filterAndSortURLs(apiLatenciesCount, apiLatencies);
  console.log("URLs: ",urls)
  console.log("apiLatenciesCount: ",apiLatenciesCount)
  console.log("apiLatencies: ",apiLatencies)

    /*
    * We use a fake connection url to force a fallback to the best of
    * the pre-defined URLs, ranked by latency
    */
    let connectionString = SettingsStore.getSetting("apiServer");
    //let connectionString = "wss://fake.automatic-selection.com";
  console.log("connectionString: ",connectionString);
    if (!connectionString) connectionString = urls[0].url;
  console.log("connectionString2: ",connectionString);
    if (connectionString.indexOf("fake.automatic-selection") !== -1) connectionString = urls[0];
  console.log("connectionString3: ",connectionString);
    if (!connectionManager) connectionManager = new Manager({url: connectionString, urls});
    if (nextState.location.pathname === "/init-error") {
        return Apis.reset(connectionString, true).init_promise
        .then(() => {
            var db;
            try {
                db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise;
            } catch(err) {
                console.log("db init error:", err);
            }
            return Promise.all([db, SettingsStore.init()]).then(() => {
                return callback();
            }).catch((err) => {
                console.log("err:", err);
                return callback();
            });
        }).catch((err) => {
            console.log("err:", err);
            return callback();
        });

    }
    let connectionCheckPromise = !apiLatenciesCount ? connectionManager.checkConnections() : null;
    Promise.all([connectionCheckPromise]).then((res => {
        if (connectionCheckPromise && res[0]) {
            let [latencies] = res;
            console.log("Connection latencies:", latencies);
            urls = filterAndSortURLs(0, latencies);
            ss.set("apiLatencies", latencies);
            connectionManager.urls = urls;
            /* Update the latencies object */
            SettingsActions.updateLatencies(latencies);
        }
        let latencies = ss.get("apiLatencies", {});
        let connectionStart = new Date().getTime();
        connectionManager.connectWithFallback(connect).then(() => {
            /* Update the latencies object and current active node */
            latencies[connectionManager.url] = new Date().getTime() - connectionStart;
            SettingsActions.changeSetting({setting: "apiServer", value: connectionManager.url});
            SettingsActions.updateLatencies(latencies);

            var db;
            try {
                db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise;
            } catch(err) {
                console.log("db init error:", err);
            }
            return Promise.all([db, SettingsStore.init()]).then(() => {
                return Promise.all([
                    PrivateKeyActions.loadDbData().then(()=> AccountRefsStore.loadDbData()),
                    WalletDb.loadDbData().then(() => {
                        // if (!WalletDb.getWallet() && nextState.location.pathname === "/") {
                        //     replaceState("/dashboard");
                        // }
                        if (nextState.location.pathname.indexOf("/auth/") === 0) {
                            replaceState("/dashboard");
                        }
                    }).catch((error) => {
                        console.error("----- WalletDb.willTransitionTo error ----->", error);
                        replaceState("/init-error");
                    }),
                    WalletManagerStore.init()
                ]).then(()=> {
                    ss.set("activeNode", connectionManager.url);
                  console.log("activeNode: ",connectionManager.url);
                    callback();
                });
            });
        }).catch( error => {
            console.error("----- App.willTransitionTo error ----->", error, (new Error).stack);
            if(error.name === "InvalidStateError") {
                if (__ELECTRON__) {
                    replaceState("/dashboard");
                } else {
                    alert("Can't access local storage.\nPlease make sure your browser is not in private/incognito mode.");
                }
            } else {
                replaceState("/init-error");
                callback();
            }
        });

        /* Only try initialize the API with connect = true on the first onEnter */
        connect = false;
    }));


    // Every 15 connections we check the latencies of the full list of nodes
    if (connect && !apiLatenciesCount && !connectionCheckPromise) connectionManager.checkConnections().then((res) => {
        console.log("Connection latencies:", res);
        ss.set("apiLatencies", res);
        SettingsActions.updateLatencies(res);
    });
};

export default willTransitionTo;
