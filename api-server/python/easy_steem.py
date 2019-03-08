
#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os, sys
import zerorpc, json
from steem.steemd import Steemd
from steem.blockchain import Blockchain
from steembase.operations import Transfer
from _thread import start_new_thread as thread
from datetime import datetime, timedelta, date
from steembase.account import PrivateKey, PublicKey
from steem.transactionbuilder import TransactionBuilder
from easy_interface import easyInterface

class easySteem(easyInterface):
    def __init__(self, **kwargs):
        easyInterface.__init__(self, Steemd, **kwargs)
        self.client = kwargs.get("client")
        self.exchange = kwargs.get("exchange")
        self.owner_account = kwargs.get("owner")
        self.confirmation = kwargs.get("confirmation")
        print(self.exchange)
        print(self.confirmation)
        print(self.owner_account)
        thread(self.__transfers, ())

    @staticmethod
    def __send_to_client(client_addr, trf, amount, asset):
        print("__send_to_client", client_addr, trf, amount, asset)
        iamount = int(round(float(amount)*1000, 3))
        if iamount < 1000: # do not send
            return
        try:
            client = zerorpc.Client()
            client.connect(client_addr)
            client.send_easydex(trf["memo"], iamount, asset, trf["trx_id"])
        except:
            print("Can't send transaction")
            easyInterface.send_mail("can't reach server on " + client_addr)
            pass

    def __transfers(self):
        blocks = []
        chain = Blockchain()
        print("Start __transfers")
        date_handler = lambda obj: (
            obj.isoformat() if isinstance(obj, (datetime, date)) else None
        )

        start_block = chain.get_current_block_num() - 1

        while True:
            try:
                head_block = chain.get_current_block_num()
                if head_block > start_block:
                    blocks += range(start_block, head_block)
                    start_block = head_block
                for block in blocks:
                    ops = chain.steem.get_ops_in_block(block, False)
                    if len(ops) == 0:
                        continue
                    blocks.remove(block)
                    print("process", block)
                    for op in ops:
                        if op['op'][0] != 'transfer':
                            continue
                        trf = dict(op['op'][1])
                        trf['trx_id'] = op['trx_id']
                        tr_keys = ['from', 'to', 'amount', 'trx_id']
                        if not all(key in trf.keys() for key in tr_keys):
                            continue
                        amount = trf['amount'].split()
                        if len(amount) != 2:
                            continue
                        if trf['from'] == self.owner_account and amount[1] in self.confirmation.keys():
                            print("Confirmation:", trf)
                            tx = dict(trf)
                            url = self.confirmation[amount[1]]
                            tx['easydex-confirm'] = 'true'
                            thread(self.post_to_server, (url, json.dumps(tx, default=date_handler)))
                            continue
                        if trf['to'] != self.owner_account:
                            continue
                        if 'memo' not in trf.keys():
                            continue
                        if amount[1] not in self.exchange.keys():
                            continue

                        tx = dict(trf)
                        tx['easydex-confirm'] = 'false'
                        url = self.exchange[amount[1]][1]
                        thread(self.post_to_server, (url, json.dumps(tx, default=date_handler)))
                        asset = self.exchange[amount[1]][0]
                        thread(self.__send_to_client, (self.client, trf, amount[0], asset))
                        print("Exchange:", trf)

            except KeyboardInterrupt:
                break
            except:
                pass

    def get_asset(self, name, args="{}"):
        print("get_asset:", name, args)
        return name

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
            "from": "foo",
            "to": "baar",
            "amount": "111.110 STEEM",
            "memo": "Fooo"
        }
        '''
        tx = {}
        tx["to"] = to
        tx["from"] = self.owner_account
        tx["amount"] = str(amount) + ' ' + str(asset)
        if memo and len(memo) > 0:
            tx["memo"] = memo
        try:
            res = self.send_transaction(json.dumps(tx))
            print("transaction:", res)
        except:
            print("Can't send transaction")
            pass
