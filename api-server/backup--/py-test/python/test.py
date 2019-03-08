
from web3 import Web3, HTTPProvider
from solc import compile_source
import time

# Solidity source code
contract_source_code = '''
pragma solidity ^0.4.18;

contract Contract {
    event Test(uint indexed x);
    function test()  {
        Test(2);
    }
}
'''

#compiled_sol = compile_source(contract_source_code) # Compiled source code
#contract_interface = compiled_sol['<stdin>:Contract']
#print (contract_interface['abi'])

w3 = Web3(HTTPProvider('http://localhost:8545'))

print(w3.personal.listAccounts)

exit(0)


#res = w3.personal.sendTransaction({'to': '0x95Eeb98a240EFE974F0F64474b65Ad230e513552',
#                                 'from': w3.eth.coinbase,
#                                 'value': 0,
#                                 'gas': '21000',
#                                 'gasPrice': '4000000000'}, 'bv09borussia')

#print(res)

last_block_num = 0

while True:
    try:
        block_num = w3.eth.blockNumber
        if last_block_num != block_num:
            transactions = w3.eth.getBlock(block_num).transactions
            for transaction in transactions:
                trx = w3.eth.getTransaction(transaction)
                print(dict(trx))
            last_block_num = block_num
        time.sleep(0.02)
    except KeyboardInterrupt:
        exit(0)
    except:
        print("exception...")
