#!/usr/bin/env node
require('source-map-support').install()

import * as colors from 'colors'
import * as program from 'commander'

import { eztz } from 'eztz.js'
import { timeout } from 'promise-timeout'

function die (message: string): void {
  console.error(colors.cyan(message))
  process.exit(1)
}

interface TransferCommand {
  node: string
  fromSK: eztz.SecretKey,
  toPKH: eztz.PublicKeyHash,
  amount: eztz.MuTez,
  fee: eztz.MuTez
  timeout: number
}

program
  .version('0.0.1', '-v, --version')
  .description('Tezos CLI using eztz')
  .on('command:*', () => {
    console.error(colors.cyan('Invalid action provided: %s.'), program.args.join(' '))
    console.error('See --help for available actions.')
    process.exit(1)
  })

program
  .command('transfer')
  .description('move funds between accounts')
  .option('-n, --node <URI>', 'Tezos node URI')
  .option('-f, --fromSK <key>', 'sender secret key')
  .option('-t, --toPKH <hash>', 'receiver public key hash')
  .option('-a, --amount <value>', 'amount to transfer in mutez')
  .option('-p, --fee <value>', 'desired operation fee in mutez')
  .option('-m, --timeout [sec]', 'timeout in seconds for request', parseInt)
  .action(async (options: TransferCommand) => {
    if (!options.node) die('No Tezos node provided.')
    if (!options.fromSK) die('No sender SK provided.')
    if (!options.toPKH) die('No receiver PKH provided.')
    if (!options.amount) die('No amount provided.')
    if (!options.fee) die('No fee provided.')
    if (!options.timeout) {
      console.log('Using default timeout (5 seconds).')
      options.timeout = 5
    }
    try {
      eztz.node.setProvider(options.node)
      const keys = eztz.crypto.extractKeys(options.fromSK)
      const tezAmount = eztz.utility.totez(options.amount)
      const tezFee = eztz.utility.totez(options.fee)
      // Usually a bad request will fail instantly, but we timeout all requests as a precaution.
      await timeout(eztz.rpc.transfer(keys.pkh, keys, options.toPKH, tezAmount, tezFee, null),
        options.timeout * 1000)
      console.log(colors.green('Transfer successfully injected.'))
    } catch (error) {
      console.error(colors.red('An error occurred. Error info below:'))
      // Catch can really catch any type, although typically Error/String.
      if (error instanceof Error && error.message) console.error(error.message)
      else if (!(error instanceof Error) && error !== '') console.error(error)
      else console.error('Unknown error (check the URI and connection).')
      process.exit(1)
    }
  })

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error(colors.cyan('No action provided.'))
  console.error('See --help for available actions.')
  process.exit(1)
}
