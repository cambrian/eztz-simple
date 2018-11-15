// Disallowed by Nexe: #!/usr/bin/env node
require('source-map-support').install()

import * as colors from 'colors'
import * as program from 'commander'

import { eztz } from 'eztz.js'
import { timeout } from 'promise-timeout'

function die (message: string): void {
  console.error(colors.magenta(message))
  process.exit(1)
}

interface TransferCommand {
  node: string
  fromSK: eztz.SecretKey,
  toPKH: eztz.PublicKeyHash,
  amount: eztz.MuTez,
  fee: eztz.MuTez
}

program
  .version('0.0.1', '-v, --version')
  .description('Tezos CLI using eztz')
  .on('command:*', () => {
    console.error('Invalid action provided: %s.\nSee --help for available actions.',
      program.args.join(' '))
    process.exit(1)
  })

program
  .command('transfer')
  .description('move funds between accounts')
  .option('-n, --node <URI>', 'Tezos node URI')
  .option('-f, --fromSK <key>', 'Sender secret key')
  .option('-t, --toPKH <hash>', 'Receiver public key hash')
  .option('-a, --amount <value>', 'Amount to transfer in mutez')
  .option('-p, --fee <value>', 'Desired operation fee in mutez')
  .action(async (options: TransferCommand) => {
    if (!options.node) die('No Tezos node provided.')
    if (!options.fromSK) die('No sender SK provided.')
    if (!options.toPKH) die('No receiver PKH provided.')
    if (!options.amount) die('No amount provided.')
    if (!options.fee) die('No fee provided.')
    try {
      eztz.node.setProvider(options.node)
      const keys = eztz.crypto.extractKeys(options.fromSK)
      const tezAmount = eztz.utility.totez(options.amount)
      const tezFee = eztz.utility.totez(options.fee)
      // Manually timeout the transfer since default behavior is to retry for a while on a bad URI.
      await timeout(eztz.rpc.transfer(keys.pkh, keys, options.toPKH, tezAmount, tezFee, null), 5000)
      console.log(colors.green('Transfer successfully injected.'))
    } catch (error) {
      console.error(colors.red('An error occurred. Error info below:'))
      // Catch can really catch any type, although typically Error/String.
      if (error instanceof Error && error.message) console.error(error.message)
      else if (!(error instanceof Error)) console.error(error)
      else console.error('Unknown error (check your connection).')
      process.exit(1)
    }
  })

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error('No action provided.\nSee --help for available action.', program.args.join(' '))
  process.exit(1)
}
