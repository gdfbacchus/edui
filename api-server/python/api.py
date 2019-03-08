
#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os, sys
import configparser
import zerorpc, json
from optparse import OptionParser
from configparser import ConfigParser
from requests import Request, Session
from grapheneapi.graphenewsrpc import RPCError

parser = OptionParser()

parser.add_option("-f", "--file", dest="config", metavar="FILE",
                  help="read configuration from file")
parser.add_option("-k", "--keys", dest="keys", metavar="FILE",
                  help="read public/private keys from file (not recommeneded)")
parser.add_option("-s", "--server", dest="server", metavar="ADDRESS",
                  help="address to explore the API, override config value")
parser.add_option("-c", "--client", dest="client", metavar="ADDRESS",
                  help="address to connect, override config value")
parser.add_option("-m", "--mode", dest="mode", metavar="MODE",
                  help="mode to run, it can be steem or bitshares")
parser.add_option("-d", "--daemon", action="store_true", dest="daemon", help="run as daemon")

(options, _) = parser.parse_args()

if not options.config:
    print("You should provide config file.")
    exit(1)

if not options.mode:
    print("You should provide mode.")
    exit(1)

modes = ['steem', 'bitshares', 'ethereum']

mode = options.mode
if mode not in modes:
    print("Mode should be one of", modes)
    exit(1)

config = ConfigParser()
config.read(options.config)

args = {}

args["nodes"] = config.get(mode, "nodes").split()
args["server"] = config.get(mode, "server")
args["client"] = config.get(mode, "client")

currency = {}
currencies = config.get(mode, "currency")
for cur_str in currencies.split('\n'):
    cur_list = cur_str.split(',')
    if len(cur_list) != 2:
        continue
    currency[cur_list[0].strip()] = cur_list[1].strip()

args["currency"] = currency

confirmation = {}
confirmations = config.get(mode, "confirmation")
for con_str in confirmations.split('\n'):
    con_list = con_str.split(',')
    if len(con_list) != 2:
        continue
    confirmation[con_list[0].strip()] = con_list[1].strip()

args["confirmation"] = confirmation

exchange = {}
exchanges = config.get(mode, "exchange")
for ex_str in exchanges.split('\n'):
    ex_list = ex_str.split(',')
    if len(ex_list) != 3:
        continue
    exchange[ex_list[0].strip()] = [ex_list[1].strip(), ex_list[2].strip()]

args["exchange"] = exchange

args["owner"] = config.get(mode, "owner")
args["wallet_pass"] = config.get(mode, "wallet_password", fallback='')
args["wallet_addr"] = config.get(mode, "wallet_address", fallback='')
args["wallet_port"] = config.get(mode, "wallet_port", fallback='')

if options.server:
    args["server"] = options.server

if options.server:
    args["client"] = options.server

keys = {}
if options.keys:
    with open(options.keys, "r") as key_file:
        for line in key_file:
            pub_priv = line.split(',')
            if len(pub_priv) == 2:
                keys[pub_priv[0].strip()] = pub_priv[1].strip()

args["keys"] = keys

def checkAddress(addr):
    if 'tcp://' not in addr[:6] and 'icp://' not in addr[:6]:
        print(addr, ": address should be tcp or unix socket (ipc)")
        #NOTE: this becomes only a warning

checkAddress(args["server"])
checkAddress(args["client"])

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
    # NOTE demonize does not work with sqlite
    daemonize()

while True:
    try:
        if mode == 'bitshares':
            from easy_bitshares import easyBitshares
            py = easyBitshares(**args)
        elif mode == 'steem':
            from easy_steem import easySteem
            py = easySteem(**args)
        elif mode == 'ethereum':
            from easy_ethereum import easyEthereum
            py = easyEthereum(**args)
        server = zerorpc.Server(py)
        server.bind(args["server"])
        server.run()
        break
    # on rpc exception try to connect again
    except RPCError as e:
        print(e)
        pass

exit(0)
