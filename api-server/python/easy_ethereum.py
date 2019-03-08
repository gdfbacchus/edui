
#!/usr/bin/python3
# -*- coding: utf-8 -*-

import string
import random
import os, sys
import sqlite3
import threading
import zerorpc, json
from web3 import Web3, HTTPProvider
from easy_interface import easyInterface
from datetime import datetime, timedelta, date
from _thread import start_new_thread as thread

class easyEthereum(object):
    __lt = threading.local()
    def __init__(self, **kwargs):
        self.node = kwargs.get("nodes")[0]
        self.client = kwargs.get("client")
        self.exchange = kwargs.get("exchange")
        self.asset = list(self.exchange.keys())[0]
        self.owner_account = kwargs.get("owner")
        self.confirmation = kwargs.get("confirmation")
        self.w3 = Web3(HTTPProvider(self.node))
        print(self.exchange)
        print(self.confirmation)
        print(self.owner_account)
        thread(self.__transfers, ())

    @staticmethod
    def __create_db_connection():
        lt = easyEthereum.__lt
        if not hasattr(lt, 'con'):
            lt.con = sqlite3.connect('eth_accounts.db')
        return lt.con

    @staticmethod
    def __generate_pass():
        letters = string.ascii_uppercase + string.ascii_lowercase + string.digits + "@#$_"
        return ''.join(random.choice(letters) for i in range(10))

    @staticmethod
    def __send_entire_balance(w3, address, to):
        print("__send_entire_balance", address, to)
        tx = {}
        tx["from"] = address
        tx["to"] = to
        tx["gas"] = 21000
        tx["gasPrice"] = w3.toWei('6', 'gwei')
        tx["nonce"] = w3.eth.getTransactionCount(tx["from"])
        balance = w3.eth.getBalance(tx["from"])
        cost = tx["gas"] * tx["gasPrice"]
        if balance <= cost:
            print('Not enough funds to perform transaction')
            return
        tx["value"] = balance - cost
        password = ''
        cr = easyEthereum.__create_db_connection().cursor()
        cr.execute('SELECT pass FROM users WHERE eth=?', (tx["from"],))
        for row in cr:
            password = row[0]
            break
        else:
            print("account missing", tx["from"])
            return
        try:
            w3.personal.sendTransaction(tx, password)
            print("transfer to main account OK")
        except:
            print("transfer to main accout NOK")
            pass

    @staticmethod
    def __send_to_client(client_addr, tx, amount, asset):
        print("__send_to_client", client_addr, tx, amount, asset)
        try:
            client = zerorpc.Client()
            client.connect(client_addr)
            cr = easyEthereum.__create_db_connection().cursor()
            cr.execute('SELECT bts FROM users WHERE eth=?', (tx['to'],))
            for row in cr:
                if 'easydex-confirm' in tx.keys():
                    tx.pop('easydex-confirm') # remove confirmation from memo
                iamount = int(round(float(amount)*100000000, 8))
                client.send_easydex(row[0], iamount, asset, json.dumps(tx))
                break
            else:
                print("missing account", tx['to'])
        except:
            print("Can't send transaction")
            easyInterface.send_mail("can't reach server on " + client_addr)
            pass

    def __create_account(self, bts):
        print("__create_account", bts)
        password = self.__generate_pass()
        eth = self.w3.personal.newAccount(password)
        con = self.__create_db_connection()
        con.execute('INSERT INTO users(eth, bts, pass) values(?, ?, ?)', (eth, bts, password))
        con.commit()
        return eth

    def __transfers(self):
        print("Start __transfers")
        txs = {}
        last_block_num = 0
        have_payments = False
        last_balance_sync = datetime.now()
        last_mail = datetime.now() - timedelta(hours=1)
        w3 = Web3(HTTPProvider(self.node))

        while True:
            try:
                block_num = w3.eth.blockNumber
                if last_block_num == block_num:
                    diff = datetime.now() - last_balance_sync
                    if diff.days >= 1 or have_payments:
                        for account in w3.eth.accounts:
                            if account == self.owner_account:
                                continue
                            self.__send_entire_balance(w3, account, self.owner_account)
                        have_payments = False
                        last_balance_sync = datetime.now()
                    for txhash in list(txs.keys()):
                        txPrice = w3.eth.getTransactionReceipt(txhash)
                        if txPrice is None:
                            continue
                        tx = txs[txhash]
                        txs.pop(txhash)
                        print('tx price', txPrice)
                        url = self.exchange[self.asset][1]
                        tx['status'] = txPrice['status']
                        tx['gasUsed'] = txPrice['gasUsed']
                        tx['cumulativeGasUsed'] = txPrice['cumulativeGasUsed']
                        thread(easyInterface.post_to_server, (url, json.dumps(tx)))
                        if tx['status'] == 0:
                            print('Transaction failure:', tx)
                            continue
                        asset = self.exchange[self.asset][0]
                        amount = w3.fromWei(tx['value'], 'ether')
                        famount = round(float(amount), 8)
                        if famount < round(0.01, 2):
                            continue # NOTE: donation
                        print('amount:', amount, 'became', famount)
                        thread(self.__send_to_client, (self.client, tx, famount, asset))
                    continue
                last_block_num = block_num
                print('New block:', block_num)
                transactions = w3.eth.getBlock(block_num).transactions
                for transaction in transactions:
                    trx = w3.eth.getTransaction(transaction)
                    tr_keys = ['from', 'to', 'value', 'hash', 'gas', 'gasPrice']
                    if not all(key in trx.keys() for key in tr_keys):
                        continue
                    if trx['to'] == self.owner_account:
                        continue
                    if trx['from'] != self.owner_account and trx['to'] not in w3.eth.accounts:
                        continue
                    tx = {}
                    tx['to'] = trx['to']
                    tx['gas'] = trx['gas']
                    tx['from'] = trx['from']
                    tx['value'] = trx['value']
                    tx['hash'] = trx['hash'].hex()
                    tx['gasPrice'] = trx['gasPrice']
                    if tx['from'] == self.owner_account:
                        print("Confirmation:", trx)
                        have_payments = True
                        tx['easydex-confirm'] = 'true'
                        url = self.confirmation[self.asset]
                        thread(easyInterface.post_to_server, (url, json.dumps(tx)))
                        continue

                    print("Wait for receipt:", trx)
                    tx['easydex-confirm'] = 'false'
                    txs[tx['hash']] = tx

            except KeyboardInterrupt:
                break
            except:
                if not w3.isConnected():
                    diff = datetime.now() - last_mail
                    if diff.seconds // 3600 >= 1:
                        last_mail = datetime.now()
                        easyInterface.send_mail("can't reach node: " + self.node)
                pass

    def ping(self):
        print("ping")
        return "pong"

    def get_eth_account(self, bts_account):
        print("get_eth_account", bts_account)
        bts_account = bts_account.replace("'", '')
        cr = self.__create_db_connection().cursor()
        cr.execute('SELECT eth FROM users WHERE bts=?', (bts_account,))
        for row in cr:
            return row[0]
        else:
            return self.__create_account(bts_account)

    def send_transaction(self, tx):
        dtx = easyInterface.jsonDict(tx)
        if "from" not in dtx.keys():
            return "missing from"
        password = ''
        cr = self.__create_db_connection().cursor()
        cr.execute('SELECT pass FROM users WHERE eth=?', (dtx["from"],))
        for row in cr:
            password = row[0]
            break
        else:
            return "account missing " + dtx["from"]
        try:
            self.w3.personal.sendTransaction(dtx, password)
        except:
            return "false"
        return "true"

    def send_easydex(self, to, amount, asset="", memo=""):
        print("send_easydex", to, amount, asset, memo)
        tx = {}
        tx["to"] = to
        tx["from"] = self.owner_account
        tx["gas"] = 21000
        tx["gasPrice"] = self.w3.toWei('6', 'gwei')
        tx["value"] = self.w3.toWei(str(amount), 'ether')
        tx["nonce"] = self.w3.eth.getTransactionCount(self.owner_account)
        try:
            res = self.send_transaction(json.dumps(tx))
            print("transaction:", res)
        except:
            print("Can't send transaction")
            pass
