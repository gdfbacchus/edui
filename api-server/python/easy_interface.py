
#!/usr/bin/python3
# -*- coding: utf-8 -*-

import ifcfg
import os, sys
import zerorpc, json
from smtplib import SMTP
from requests import Request, Session
from grapheneapi.graphenewsrpc import RPCError
from grapheneapi.grapheneapi import GrapheneAPI

class easyInterface(object):
    def __init__(self, bc, **kwargs):
        self.bc = bc
        self.wallet_addr = kwargs.get("wallet_addr")
        self.wallet_port = kwargs.get("wallet_port")
        self.wallet_pass = kwargs.get("wallet_pass")
        self.keys = kwargs.get("keys")
        if len(self.keys) > 0:
            self.pub_wif = lambda x: self.keys[x] if x in self.keys.keys() else ''

    @staticmethod
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

    @staticmethod
    def send_mail(text):
        FROM = "bot@easydex.net"
        TO = ["admin@easydex.net", "bot@easydex.net"]
        smtp = SMTP("easydex.net")
        smtp.login(FROM, "Riy28&q9")
        iface = ifcfg.default_interface()
        if "inet" in iface.keys():
            addr = iface["inet"]
        else:
            addr = iface["inet4"]
        body = ("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n"
            % (FROM, ", ".join(TO), "Warning on crypto bridge"))
        body += str(addr) + " says: " + text
        smtp.sendmail(FROM, TO, body)
        smtp.quit()

    @staticmethod
    def post_to_server(addr, message):

        print("post_to_server ... ")

        req = Request('POST', addr)
        prepped = req.prepare()

        prepped.headers['Content-Type'] = "application/json"
        prepped.headers['Content-Length'] = len(message)

        ''' example
        {
            "from_account":"1.2.882409",
            "asset":"1.3.3059",
            "easydex_code":"easydex-w-code_81xNdvsXC1RmB2Vc3AogEqA4cJaLlLmWoJ1w4",
            "amount":"0.00001000",
            "minerFee": "0.00000010",
            "memo_text_msg": "test 3"
        }'''

        prepped.body = message

        try:
            resp = Session().send(prepped, verify = True, allow_redirects = True)
            print(resp)
        except:
            pass

    def pub_wif(self, pub):
        key = ''
        try:
            wallet = GrapheneAPI(self.wallet_addr, self.wallet_port)
            try:
                wallet.unlock(self.wallet_pass)
                key = wallet.get_private_key(pub)
            finally:
                wallet.lock()
        except:
            self.send_mail("check wallet on " + self.wallet_addr + ":" + self.wallet_port)
            pass
        return key

    def account_key(self, account):
        try:
            keys = dict(self.get_account(account)).get("active", {}).get("key_auths", "")
            if len(keys) > 0 and len(keys[0]) > 0:
                return keys[0][0]
        except:
            pass
        return ""

    # test connection
    def ping(self):
        print("ping")
        return 'pong'

    # @param name - string
    # @param args - json string
    def get_asset(self, name, args="{}"):
        print("get_asset:", name, args)
        return self.bc().get_asset(name, **self.jsonDict(args))

    # @param tx - string
    def get_potential_signatures(self, tx):
        print("get_potential_signatures:", tx)
        return self.bc().get_potential_signatures(tx)

    # @param tx - json string
    def broadcast_transaction(self, tx):
        print("broadcast_transaction:", tx)
        return self.bc().broadcast_transaction(tx, api="network_broadcast")

    # @param name - string
    # @param args - json string
    def get_account(self, name, args="{}"):
        print("get_account:", name, args)
        return self.bc().get_account(name, **self.jsonDict(args))

    def get_market_history_buckets(self):
        print("get_market_history_buckets:")
        return self.bc().get_market_history_buckets()

    # @param tx - json string names by spaces
    # @param keys - string keys by spaces
    def get_required_signatures(self, tx, keys):
        print("get_required_signatures:", tx, keys)
        return self.bc().get_required_signatures(tx, keys.split())

    # @param account - string name
    # @param status - boolean string (True / False)
    def get_account_history(self, account, index, limit):
        print("get_account_history:", account, index, limit)
        return self.bc().get_account_history(account, int(index), int(limit))

    def send_transaction(self, tx, tb):
        print("send_transaction", tx)
        ''' example
        {
            "from": "1.2.459605",
            "to": "1.2.196550",
            "amount": { "amount": 1, "asset_id": "1.3.3059" },
        }
        '''
        dtx = self.jsonDict(tx)
        if "from" not in dtx.keys():
            return "missing from"
        key = self.account_key(dtx["from"])
        if len(key) == 0:
            print("transaction: can't get active key")
            return "active key missing"
        pKey = self.pub_wif(key)
        if len(pKey) == 0:
            print("Can't get private key")
            return "private key missing"
        try:
            tb.appendWif(pKey)
            tb.sign()
            tb.broadcast()
        except RPCError as e:
            return "error: " + str(e)
        except Exception as e:
            return "error: " + str(e)
        except:
            return "false"
        return "true"
