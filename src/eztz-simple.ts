#!/usr/bin/env node
require('source-map-support').install()

import * as colors from 'colors'
import * as program from 'commander'

import { eztz } from 'eztz.js'
import { timeout } from 'promise-timeout'

interface ForgeBatchTransferCommand {
  node: string
  fromSK: eztz.SecretKey,
  recipient: [[eztz.PublicKeyHash, eztz.MuTez] | undefined],
  fee: eztz.MuTez
  timeout: number
}

interface ExtractCommand {
  secret: eztz.SecretKey
}

interface InjectCommand {
  node: string,
  object: string,
  signed: string
  timeout: number
}

// Prints an error to console. For programmatic use of the CLI, the last word of error output
// contains an error kind value (either fatal, timeout, or connection). If callers wish to retry CLI
// commands, they should only do so if the error kind is NOT fatal.
function handleError (error: any): void {
  const errorKind = (kind: string) => colors.cyan('Error Kind:') + ' ' + kind
  console.error(colors.red('An error occurred. Error info below:'))
  if (error !== '') {
    console.error(colors.gray(error))
    if (error.message === 'Timeout') console.error(errorKind('timeout'))
    else console.error(errorKind('fatal'))
  } else {
    console.error(colors.gray('Probable connection error (verify URI).'))
    console.error(errorKind('connection'))
  }
  process.exit(1)
}

function tryRunning (action: (...args: any[]) => Promise<any>):
  (...args: any[]) => Promise<any> {
  return async (...args) => {
    try {
      await action(...args)
    } catch (error) {
      handleError(error)
    }
  }
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

function buildTransferOp (
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
  .option('-m, --timeout <sec>', 'Timeout in seconds for request', parseInt)
  .action(tryRunning(async (options: ForgeBatchTransferCommand) => {
    if (!options.node) throw new Error('No Tezos node provided.')
    if (!options.fromSK) throw new Error('No sender SK provided.')
    if (options.recipient.length <= 0) throw new Error('No recipients provided.')
    if (options.recipient.indexOf(undefined) !== -1) throw new Error('Malformed recipient(s).')
    const recipients = options.recipient as [[eztz.PublicKeyHash, eztz.MuTez]]
    if (!options.fee) throw new Error('No fee provided.')
    if (!options.timeout) throw new Error('No timeout provided.')

    eztz.node.setProvider(options.node)
    const keys = eztz.crypto.extractKeys(options.fromSK)
    const secretKey = keys.sk as eztz.SecretKey
    keys.sk = false // Short-circuits the injection after forge.
    const transferOps = recipients.map(([toPKH, amount]) =>
      buildTransferOp(toPKH, amount, options.fee))
    // Usually a bad request will fail instantly, but we timeout all requests as a precaution.
    const forgeResult = await timeout(
      eztz.rpc.sendOperation(keys.pkh, transferOps, keys),
      options.timeout * 1000
    ) as eztz.ForgeResult
    let signResult = eztz.crypto.sign(forgeResult.opbytes, secretKey, eztz.watermark.generic)
    forgeResult.opOb.signature = signResult.edsig

    console.log(colors.green('Transfer forged with the following bytes and object:'))
    console.log(signResult.sbytes)
    console.log(JSON.stringify(forgeResult.opOb))
  }))

program
  .command('extract')
  .description('get the public key hash for a secret')
  .option('-s, --secret <key>', 'Secret key')
  .action(tryRunning(async (options: ExtractCommand) => {
    if (!options.secret) throw new Error('No secret key provided.')
    const keys = eztz.crypto.extractKeys(options.secret)
    if (!keys.pkh) throw new Error('Extraction failed on a bad secret key.')
    console.log(colors.green('Extracted the following public key hash:'))
    console.log(keys.pkh)
  }))

program
  .command('inject')
  .description('pre-validate and inject an operation')
  .option('-n, --node <URI>', 'Tezos node URI')
  .option('-s, --signed <bytes>', 'Signed operation bytes')
  .option('-o, --object <JSON>', 'Serialized operation object')
  .option('-m, --timeout <sec>', 'Timeout in seconds for request', parseInt)
  .action(tryRunning(async (options: InjectCommand) => {
    if (!options.node) throw new Error('No Tezos node provided.')
    if (!options.signed) throw new Error('No signed operation bytes provided.')
    if (!options.object) throw new Error('No operation object provided.')
    if (!options.timeout) throw new Error('No timeout provided.')

    eztz.node.setProvider(options.node)
    const object = JSON.parse(options.object)
    const injectResult = await timeout(
      eztz.rpc.inject(object, options.signed),
      options.timeout * 1000
    ) as eztz.InjectResult

    console.log(colors.green('Injected operation with hash:'))
    console.log(injectResult.hash)
  }))

program
  .parse(process.argv)

// Cannot be chained....
if (program.args.length < 1) {
  console.error(colors.cyan('No action provided.'))
  console.error('See --help for available actions.')
  process.exit(1)
}
