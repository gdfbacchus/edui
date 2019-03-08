#!/bin/bash

wallet=$(ps -ef | grep -v grep | grep 'cli_wallet -d -s ws://93.104.208.139:8090')
[ -z "${wallet}" ] && bash -c './cli_wallet -d -s ws://93.104.208.139:8090 --rpc-http-endpoint="127.0.0.1:9090" &' || echo 'wallet was started'

bitshares=$(ps -ef | grep -v grep | grep 'api.py -d -m bitshares')
[ -z "${bitshares}" ] && bash -c 'python3 api.py -d -m bitshares --file=api.config &' || echo 'bitshares was started'

steem=$(ps -ef | grep -v grep | grep 'api.py -d -m steem')
[ -z "${steem}" ] && bash -c 'python3 api.py -d -m steem --file=api.config --keys=steem.keys &' || echo 'steem was started'

ethereum=$(ps -ef | grep -v grep | grep 'api.py -m ethereum')
[ -z "${ethereum}" ] && bash -c 'nohup python3 api.py -m ethereum --file=api.config &' || echo 'ethereum was started'

geth=$(ps -ef | grep -v grep | grep 'geth --rpcapi eth,web3,personal --rpc')
[ -z "${geth}" ] && bash -c   'nohup geth --rpcapi eth,web3,personal --rpc &' || echo 'geth was started'
