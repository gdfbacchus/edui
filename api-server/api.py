
#!/usr/bin/python3

import os, sys
import zmq.auth
import socket, ssl
import configparser
import zerorpc, json
import _thread as thread
from bitshares import BitShares
from multiprocessing import Lock
from optparse import OptionParser
from bitshares.notify import Notify
from configparser import ConfigParser
from requests import Request, Session
from bitsharesbase import memo as Memo
from bitsharesbase.operations import Transfer
from grapheneapi.graphenewsrpc import RPCError
from grapheneapi.grapheneapi import GrapheneAPI
from zmq.auth.thread import ThreadAuthenticator
from bitsharesbase.account import PrivateKey, PublicKey
from bitshares.transactionbuilder import TransactionBuilder

# default
password = 'abcd'
wallet_port = 8092
wallet_addr = "localhost"
s_addr = 'tcp://127.0.0.1:4242'
nodes = ['ws://127.0.0.1:8090']
config_currencies = {}

def checkAddress(addr):
    if 'tcp://' not in addr[:6] and 'icp://' not in addr[:6]:
        print(addr, ": address should be tcp or unix socket (ipc)")
        exit(2)

def bConnect(nodes):
    for node in nodes:
        try:
            bs = BitShares(node, num_retries = 3)
            print('Connect to', node, bs.info())
            return bs
        except:
            print("Can't reach", node)
            pass
    else:
        print("Does not find any running node, exiting...")
        exit(3)

def jsonDict(data):
    try:
        return json.loads(data)
    except ValueError as e:
        print(data, ':', e)
        pass
    except:
        print(data, ': unhandled exception!!!')
        pass
    return {}

class pyAPI(object):
    def __init__(self, bs):
        self.bs = bs
        self.wallet = None
        # protect wallet
        self.mutex = Lock()
        self.notify = Notify(on_tx = self.__transaction, **{'bitshares_instance' : self.bs})
        self.thread = thread.start_new_thread(self.notify.listen, ())
        self.currencies = {}
        for currency in config_currencies:
            asset = self.get_asset(currency)
            if not "id" in asset.keys():
                print("Can't get asset for", currency)
                continue
            self.currencies[asset["id"]] = config_currencies[currency]

    # NOTE: internal functions, do not call them externally!

    def __ensureWallet(self):
        if not self.wallet:
            try:
                self.wallet = GrapheneAPI(wallet_addr, wallet_port)
            except:
                self.wallet = None
                print("Can't reach wallet", wallet_addr, wallet_port)
                pass
        return self.wallet

    def __post_to_server(self, addr, json_str):

        s = Session()
        req = Request('POST', addr)
        prepped = req.prepare()

        prepped.headers['Content-Type'] = "application/json"
        prepped.headers['Content-Length'] = len(json_str)

        ''' example
        {
            "from_account":"1.2.882409",
            "asset":"1.3.3059",
            "easydex_code":"easydex-w-code_81xNdvsXC1RmB2Vc3AogEqA4cJaLlLmWoJ1w4",
            "amount":"0.00001000",
            "minerFee": "0.00000010",
            "memo_text_msg": "test 3"
        }'''

        prepped.body = json_str

        resp = s.send(prepped, verify = True, allow_redirects = True)
        print(resp)

    def __owner_wif(self):
        with self.mutex:
            if not self.__ensureWallet():
                return ''

            key = ''
            try:
                self.wallet.unlock(password)
                accounts = self.wallet.list_my_accounts()
                if len(accounts) > 0:
                    account = accounts[0]
                    if 'owner' in account.keys():
                        owner = account['owner']
                        if 'key_auths' in owner.keys():
                            keys = owner['key_auths']
                            if len(keys) > 0 and len(keys[0]) > 0:
                                key = self.wallet.get_private_key(keys[0][0])
            except:
                pass
            self.wallet.lock()
            return key

    def __memo_key(self):
        with self.mutex:
            if not self.__ensureWallet():
                return ''

            key = ''
            try:
                self.wallet.unlock(password)
                accounts = self.wallet.list_my_accounts()
                if len(accounts) > 0:
                    account = accounts[0]
                    if 'options' in account.keys():
                        options = account['options']
                        if 'memo_key' in options.keys():
                            key = options['memo_key']
            except:
                pass
            self.wallet.lock()
            return key

    def __account_id(self):
        with self.mutex:
            if not self.__ensureWallet():
                return ''

            account_id = ''
            try:
                self.wallet.unlock(password)
                accounts = self.wallet.list_my_accounts()
                if len(accounts) > 0:
                    account = accounts[0]
                    if 'id' in account.keys():
                        account_id = account['id']
            except:
                pass
            self.wallet.lock()
            return account_id

    def __pub_wif(self, pub):
        with self.mutex:
            if not self.__ensureWallet():
                return ''

            key = ''
            try:
                self.wallet.unlock(password)
                key = self.wallet.get_private_key(pub)
            except:
                pass
            self.wallet.lock()
            return key

    def __transaction(self, tx):
        if 'operations' not in tx.keys():
            return
        ops_data = tx['operations']
        if len(ops_data) < 1 or len(ops_data[0]) < 2:
            return
        if ops_data[0][0] != 0: # transaction
            return
        ops = ops_data[0][1]
        if 'from' not in ops.keys():
            return
        if 'to' not in ops.keys() or ops['to'] != self.__account_id():
            return
        if 'amount' not in ops.keys() or 'asset_id' not in ops['amount'].keys():
            return
        asset_id = ops['amount']['asset_id']
        if asset_id not in self.currencies.keys():
            return
        if 'memo' not in ops.keys():
            return
        print(tx)
        memo = ops['memo']
        if 'to' not in memo.keys():
            return
        if 'from' not in memo.keys():
            return
        if 'nonce' not in memo.keys():
            return
        if 'message' not in memo.keys():
            return
        msg = Memo.decode_memo(PrivateKey(self.__pub_wif(memo['to'])),
                               PublicKey(memo['from']),
                               memo['nonce'],
                               memo['message'])

        host = self.currencies[asset_id]
        try:
            thread.start_new_thread(self.__post_to_server, (host, msg))
        except:
            print("Can't post transaction to server")
            pass

    def __market(self, mt):
        try:
            thread.start_new_thread(self.__post_to_server, ("", json.dumps(mt)))
        except:
            print("Can't post market to server")
            pass

    # NOTE: API functions, use them externally

    # test connection
    def ping(self):
        print("ping")
        return 'pong'

    # @param name - string
    # @param args - json string
    def get_asset(self, name, args="{}"):
        print("get_asset:", name, args)
        return self.bs.rpc.get_asset(name, **jsonDict(args))

    # @param op - string
    # @param asset - string
    def get_required_fees(self, op, asset):
        print("get_required_fees:", op, asset)
        return self.bs.rpc.get_required_fees([op], asset)

    # @param tx - string
    def get_potential_signatures(self, tx):
        print("get_potential_signatures:", tx)
        return self.bs.rpc.get_potential_signatures(tx)

    # @param tx - string
    def get_potential_address_signatures(self, tx):
        print("get_potential_address_signatures:", tx)
        return self.bs.rpc.get_potential_address_signatures(tx)

    # @param asset - string
    # @param limit - string int
    def get_call_orders(self, asset, limit):
        print("get_call_orders:", asset, limit)
        return self.bs.rpc.get_call_orders(asset, int(limit))

    # @param asset - string
    # @param limit - string int
    def get_settle_orders(self, asset, limit):
        print("get_settle_orders:", asset, limit)
        return self.bs.rpc.get_settle_orders(asset, int(limit))

    # @param asset1 - string
    # @param asset2 - string
    # @param limit - string int
    def get_limit_orders(self, asset1, asset2, limit):
        print("get_limit_orders:", asset1, asset2, limit)
        return self.bs.rpc.get_limit_orders(asset1, asset2, int(limit))

    # @param asset1 - string
    # @param asset2 - string
    # @param limit - string int
    def get_fill_order_history(self, asset1, asset2, limit):
        print("get_fill_order_history:", asset1, asset2, limit)
        return self.bs.rpc.get_fill_order_history(asset1, asset2, int(limit)*2, api="history")

    # @param tx - json string
    def broadcast_transaction(self, tx):
        print("broadcast_transaction:", tx)
        return self.bs.rpc.broadcast_transaction(tx, api="network_broadcast")

    # @param objects - string names by spaces
    def get_objects(self, objects):
        print("get_objects:", objects)
        return self.bs.rpc.get_objects(objects.split())

    # @param name - string
    # @param args - json string
    def get_account(self, name, args="{}"):
        print("get_account:", name, args)
        return self.bs.rpc.get_account(name, **jsonDict(args))

    def get_market_history_buckets(self):
        print("get_market_history_buckets:")
        return self.bs.rpc.get_market_history_buckets()

    # @param tx - json string names by spaces
    # @param keys - string keys by spaces
    def get_required_signatures(self, tx, keys):
        print("get_required_signatures:", tx, keys)
        return self.bs.rpc.get_required_signatures(tx, keys.split())

    # @param accounts - string names by spaces
    # @param status - boolean string (True / False)
    def get_full_accounts(self, accounts, status):
        print("get_full_accounts:", accounts, status)
        return self.bs.rpc.get_account(accouts.split(), bool(status))

    # @param accounts - string names by spaces
    # @param status - boolean string (True / False)
    def get_account_history(self, accounts, status):
        print("get_account_history:", accounts, status)
        return self.bs.rpc.get_account_history(accouts.split(), bool(status))

    # @param asset1 - string
    # @param asset2 - string
    # @param bucket_time - string int
    # @param start_time - string int
    # @param end_time - string int
    def get_market_history(self, asset1, asset2, bucket_time, start_time, end_time):
        print("get_market_history:", asset1, asset2, bucket_time, start_time, end_time)
        return self.bs.rpc.get_market_history(asset1, asset2, int(bucket_time), int(start_time), int(end_time))

    def send_transaction(self, tx):
        print("send_transaction", tx)
        ''' example
        {
            "fee": { "amount": 0, "asset_id": "1.3.0" },
            "from": "1.2.459605",
            "to": "1.2.196550",
            "amount": { "amount": 1, "asset_id": "1.3.3059" },
            "extensions": []
        }
        '''
        tb = TransactionBuilder(**{'bitshares_instance' : self.bs})
        tb.appendOps(Transfer(**jsonDict(tx)))
        key = self.__owner_wif()
        if len(key) == 0:
            print("transaction: can't get pivate key")
            return 'Private key missing'
        try:
            tb.appendWif(key)
            tb.sign()
            tb.broadcast()
        except RPCError as e:
            return str(e)
        except Exception as e:
            return str(e)
        except:
            return 'false'
        return 'true'


parser = OptionParser()

parser.add_option("-f", "--file", dest="config", metavar="FILE",
                  help="read configuration from file")
parser.add_option("-s", "--server", dest="server", metavar="ADDRESS",
                  help="address to explore the API, override config value")
parser.add_option("-d", "--daemon", action="store_true", dest="daemon", help="run as daemon")

(options, args) = parser.parse_args()

if not options.config and not options.server:
    print("You should provide config file and/or server address")
    exit(1)

if options.config:
    config = ConfigParser()
    try:
        config.read(options.config)
        urls = config.get("nodes", "urls")
        s_addr = config.get("sockets", "server")
        password = config.get("wallet", "password")
        wallet_addr = config.get("wallet", "address")
        wallet_port = config.get("wallet", "port")
        nodes = urls.split()
        for option in config.options("notify"):
            value = config.get("notify", option)
            values = config.get("notify", option).split(',')
            if len(values) != 2:
                print("notify should be pair key, value, found", value)
                continue
            config_currencies[values[0].strip()] = values[1].strip()
    except configparser.Error as e:
        print(options.config, ':', e)
        print("Continue by default config...")
        pass

if options.server:
    s_addr = options.server

checkAddress(s_addr)

def daemonize():
    try:
        pid = os.fork()
        if pid > 0:
            # exit first parent
            sys.exit(0)
    except OSError as err:
        sys.stderr.write('_Fork #1 failed: {0}\n'.format(err))
        sys.exit(1)
    # decouple from parent environment
    os.chdir('/')
    os.setsid()
    os.umask(0)
    # do second fork
    try:
        pid = os.fork()
        if pid > 0:
            # exit from second parent
            sys.exit(0)
    except OSError as err:
        sys.stderr.write('_Fork #2 failed: {0}\n'.format(err))
        sys.exit(1)
    # redirect standard file descriptors
    sys.stdout.flush()
    sys.stderr.flush()
    si = open(os.devnull, 'r')
    so = open(os.devnull, 'w')
    se = open(os.devnull, 'w')
    os.dup2(si.fileno(), sys.stdin.fileno())
    os.dup2(so.fileno(), sys.stdout.fileno())
    os.dup2(se.fileno(), sys.stderr.fileno())
    print("Running in daemon mode ...")

if options.daemon:
    daemonize()

while True:
    try:
        server = zerorpc.Server(pyAPI(bConnect(nodes)))
     #   ctx = zerorpc.Context.get_instance()
     #   auth = ThreadAuthenticator(ctx)
     #   auth.start()
     #   auth.allow('127.0.0.1')
     #   auth.configure_curve(domain='*', location='public_keys')
     #   server_public, server_secret = zmq.auth.load_certificate("private_keys/server.key_secret")
     #   server._events._socket.curve_secretkey = server_secret
     #   server._events._socket.curve_publickey = server_public
     #   server._events._socket.curve_server = True
        server.bind(s_addr)
        server.run()
        break
    # on rpc exception try to connect again
    except RPCError as e:
        print(e)
        pass

exit(0)
