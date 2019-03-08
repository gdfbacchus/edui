
#!/usr/bin/python3
# -*- coding: utf-8 -*-

import time
import os, sys
import zerorpc, json
from bitshares import BitShares
from bitshares.notify import Notify
from bitsharesbase import memo as Memo
from bitsharesbase.operations import Transfer
from _thread import start_new_thread as thread
from datetime import datetime, timedelta, date
from bitsharesbase.account import PrivateKey, PublicKey
from bitshares.transactionbuilder import TransactionBuilder
from easy_interface import easyInterface

class easyBitshares(easyInterface):
    def __init__(self, **kwargs):
        self.codes = {}
        self.__connection = None
        self.nodes = kwargs.get("nodes")
        easyInterface.__init__(self, self.__rpc_connection, **kwargs)
        self.currency = self.__dict_asset(kwargs.get("currency"))
        self.exchange = self.__dict_asset(kwargs.get("exchange"))
        self.confirmation = self.__dict_asset(kwargs.get("confirmation"))
        print(self.currency)
        print(self.exchange)
        print(self.confirmation)
        account = dict(self.get_account(kwargs.get("owner")))
        if "id" not in account.keys():
            print("Can't get accout id stopping...")
            exit(4)
        self.owner_account = account["id"]
        print(self.owner_account)
        dclients = {}
        clients = kwargs.get("client")
        for client in clients.split('\n'):
            c_list = client.split(',')
            if len(c_list) != 2:
                continue
            dclients[c_list[0].strip()] = c_list[1].strip()
        self.clients = self.__dict_asset(dclients)
        print(self.clients)
        self.notify = Notify(on_tx = self.__transaction)
        self.thread = thread(self.notify.listen, ())

    def __dict_asset(self, data):
        result = {}
        for key in data.keys():
            asset = dict(self.get_asset(key))
            if "id" not in asset.keys():
                continue
            result[asset["id"]] = data[key]
        return result

    @staticmethod
    def __connect(nodes):
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

    def __rpc_connection(self):
        if self.__connection and self.__connection.is_connected():
            try:
                if self.__connection.info():
                    return self.__connection.rpc
                thread(easyInterface.send_mail, ("node is down, will try another one...",))
            except:
                pass
        self.__connection = self.__connect(self.nodes)
        return self.__connection.rpc

    @staticmethod
    def __send_to_client(client_addr, msg, asset):
        print("__send_to_client", client_addr, msg, asset)
        try:
            client = zerorpc.Client()
            client.connect(client_addr)
            res = client.send_easydex(msg["address"], msg["amount"], asset, msg["memo_text_msg"])
            print("transaction:", res)
        except:
            print("Can't send transaction")
            easyInterface.send_mail("can't reach server on " + client_addr)
            pass

    def __transaction(self, tx):
        if 'operations' not in tx.keys():
            return
        ops_data = tx['operations']
        if len(ops_data) < 1 or len(ops_data[0]) < 2:
            return
        if ops_data[0][0] != 0: # transaction
            return
        ops = dict(ops_data[0][1])
        tr_keys = ['from', 'to', 'memo', 'amount']
        if not all(key in ops.keys() for key in tr_keys):
            return
        memo = dict(ops['memo'])
        memo_keys = ['to', 'from', 'nonce', 'message']
        if not all(key in memo.keys() for key in memo_keys):
            return
        asset_id = dict(ops['amount']).get('asset_id', '')
        if ops['from'] == self.owner_account and asset_id in self.confirmation.keys():
            print("Confirmation:", tx)
            try:
                msg = self.decode_memo(self.pub_wif(memo['from']),
                                                    memo['to'],
                                                    memo['nonce'],
                                                    memo['message'])
                trx = {}
                trx['trx_id'] = msg
                trx['easydex-confirm'] = 'true'
                trx['signatures'] = tx['signatures']
                url = self.confirmation[asset_id]
                thread(self.post_to_server, (url, json.dumps(trx)))
            except:
                print("Can't decode memo", memo)
                pass
            return
        if ops['to'] != self.owner_account:
            return
        try:
            msg = self.decode_memo(self.pub_wif(memo['to']),
                                                memo['from'],
                                                memo['nonce'],
                                                memo['message'])
        except:
            print("Can't decode memo", memo)
            return

        dt = self.jsonDict(msg)
        if dt['easydex_code'] in self.codes.values():
            print("tx present", tx)
            return

        for time_code in list(self.codes.keys()):
            diff = datetime.now() - time_code
            if diff.days > 1:
                self.codes.pop(time_code)

        if asset_id in self.exchange.keys():
            print("Exchange:", tx)
            # NOTE get client address from config
            thread(self.__send_to_client, (self.clients[asset_id], dt, self.exchange[asset_id][0]))
            dt['easydex-confirm'] = 'false'
            url = self.exchange[asset_id][1]
            self.codes[datetime.now()] = dt['easydex_code']
            thread(self.post_to_server, (url, json.dumps(dt)))
            return
        if asset_id not in self.currency.keys():
            return
        print("Regular:", tx)
        host = self.currency[asset_id]
        thread(self.post_to_server, (host, msg))

    def decode_memo(self, priv, pub, nonce, msg):
        return Memo.decode_memo(PrivateKey(priv), PublicKey(pub), nonce, msg)

    def encode_memo(self, fr, to, msg):
        pub_fr = self.account_key(fr)
        pub_to = self.account_key(to)
        nonce = str(int(time.time()))
        memo = {
            "from": pub_fr, "to": pub_to, "nonce": nonce,
            "message": Memo.encode_memo(PrivateKey(self.pub_wif(pub_fr)),
                                                       PublicKey(pub_to),
                                                                   nonce,
                                                                     msg)
        }
        return memo

    def send_transaction(self, tx):
        dtx = self.jsonDict(tx)
        if len(dtx) == 0:
            return "invalid transaction"
        tb = TransactionBuilder()
        tb.appendOps(Transfer(**dtx))
        return easyInterface.send_transaction(self, tx, tb)

    def send_easydex(self, to, amount, asset, memo=""):
        print("send_easydex", to, amount, asset, memo)
        ''' example
        {
            "fee": { "amount": 0, "asset_id": "1.3.0" },
            "from": "1.2.459605",
            "to": "1.2.196550",
            "amount": { "amount": 1, "asset_id": "1.3.3059" },
            "extensions": []
        }
        '''
        try:
            tx = {}
            asset = dict(self.get_asset(asset)).get("id", asset)
            tx["fee"] = { "amount": 0, "asset_id": "1.3.0" }
            tx["to"] = dict(self.get_account(to)).get("id", to)
            tx["from"] = self.owner_account
            tx["amount"] = { "amount": amount, "asset_id": asset }
            if memo and len(memo) > 0:
                tx["memo"] = self.encode_memo(tx["from"], tx["to"], memo)
            tx["extensions"] = []
            res = self.send_transaction(json.dumps(tx))
            print(res)
        except:
            print("Can't send transaction")
            pass
