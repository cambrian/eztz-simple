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
interface ForgeBatchTransferCommand {
  node: string
  fromSK: eztz.SecretKey,
  recipient: [[eztz.PublicKeyHash, eztz.MuTez] | undefined],
  fee: eztz.MuTez
  timeout: number
}

interface ExtractCommand {
  node: string
  secret: eztz.SecretKey,
}

function handleError (error: any): void {
  console.error(colors.red('An error occurred. Error info below:'))
  // Catch can really catch any type, although typically Error/String.
  if (error instanceof Error && error.message) console.error(error.message)
  else if (!(error instanceof Error) && error !== '') console.error(error)
  else console.error('Unknown error (check the URI and connection).')
  process.exit(1)
}

program
  .version('0.0.1', '-v, --version')
  .description('Tezos CLI using eztz')
  .on('command:*', () => {
    console.error(colors.cyan('Invalid action provided: %s.'), program.args.join(' '))
    console.error('See --help for available actions.')
    process.exit(1)
  })

function collectRecipient (
  value: string,
  collector: Array<[eztz.PublicKeyHash, eztz.MuTez] | undefined>
): Array<[eztz.PublicKeyHash, eztz.MuTez] | undefined> {
  const tuple = value.split('@')
  if (tuple.length !== 2) collector.push(undefined)
  else collector.push(tuple as [eztz.PublicKeyHash, eztz.MuTez])
  return collector
}

function makeTransfer (
  toPKH: eztz.PublicKeyHash,
  amount: eztz.MuTez,
  fee: eztz.MuTez
): eztz.TransferOperation {
  return {
    kind: 'transaction',
    fee,
    gas_limit: '200', // Default from EZTZ.
    storage_limit: '0', // Default from EZTZ.
    amount,
    destination: toPKH
  }
}

program
  .command('forgeBatchTransfer')
  .description('forge a batch transfer to many recipients')
  .option('-n, --node <URI>', 'Tezos node URI')
  .option('-f, --fromSK <key>', 'Sender secret key')
  .option('-r, --recipient <hash>@<mutez>', 'A recipient in the batch', collectRecipient, [])
  .option('-p, --fee <mutez>', 'Operation fee per recipient in mutez')
  .option('-m, --timeout [sec]', 'Timeout in seconds for request', parseInt)
  .action(async (options: ForgeBatchTransferCommand) => {
    if (!options.node) die('No Tezos node provided.')
    if (!options.fromSK) die('No sender SK provided.')
    if (options.recipient.length <= 0) die('No recipients provided.')
    if (options.recipient.indexOf(undefined) !== -1) die('Malformed recipient(s).')
    const recipients = options.recipient as [[eztz.PublicKeyHash, eztz.MuTez]]
    if (!options.fee) die('No fee provided.')
    if (!options.timeout) {
      console.log('Using default timeout (5 seconds).')
      options.timeout = 5
    }
    try {
      eztz.node.setProvider(options.node)
      const keys = eztz.crypto.extractKeys(options.fromSK)
      const secretKey = keys.sk as eztz.SecretKey
      keys.sk = false // Short-circuits the injection after forge.
      const transferOps = recipients.map(([toPKH, amount]) =>
        makeTransfer(toPKH, amount, options.fee))
      // Usually a bad request will fail instantly, but we timeout all requests as a precaution.
      const forgeResult = await timeout(
        eztz.rpc.sendOperation(keys.pkh, transferOps, keys),
        options.timeout * 1000
      ) as eztz.ForgedTransferResult
      let signResult = eztz.crypto.sign(forgeResult.opbytes, secretKey, eztz.watermark.generic)
      // TODO: Pre-validate forged operation (will require some modification to EZTZ).
      console.log(colors.green('Transfer forged with the following signed contents:'))
      console.log(signResult.sbytes)
    } catch (error) {
      handleError(error)
    }
  })

program
  .command('extract')
  .description('get the public key hash for a secret')
  .option('-n, --node <URI>', 'Tezos node URI')
  .option('-s, --secret <key>', 'Secret key')
  .action(async (options: ExtractCommand) => {
    if (!options.node) die('No Tezos node provided.')
    if (!options.secret) die('No secret key provided.')
    try {
      eztz.node.setProvider(options.node)
      const keys = eztz.crypto.extractKeys(options.secret)
      if (!keys.pkh) throw new Error('Extraction failed on a bad secret key.')
      console.log(colors.green('Extracted the following public key hash:'))
      console.log(keys.pkh)
    } catch (error) {
      handleError(error)
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
