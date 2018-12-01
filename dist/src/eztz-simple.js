#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const colors = require("colors");
const program = require("commander");
const eztz_js_1 = require("eztz.js");
const promise_timeout_1 = require("promise-timeout");
// Prints an error to console. For programmatic use of the CLI, the last word of error output
// contains an error kind value (either fatal, timeout, or connection). If callers wish to retry CLI
// commands, they should only do so if the error kind is NOT fatal.
function handleError(error) {
    const errorKind = (kind) => colors.cyan('Error Kind:') + ' ' + kind;
    console.error(colors.red('An error occurred. Error info below:'));
    if (error !== '') {
        console.error(colors.gray(error));
        if (error.message === 'Timeout')
            console.error(errorKind('timeout'));
        else
            console.error(errorKind('fatal'));
    }
    else {
        console.error(colors.gray('Probable connection error (verify URI).'));
        console.error(errorKind('connection'));
    }
    process.exit(1);
}
function tryRunning(action) {
    return async (...args) => {
        try {
            await action(...args);
        }
        catch (error) {
            handleError(error);
        }
    };
}
program
    .version('0.0.1', '-v, --version')
    .description('Tezos CLI using eztz')
    .on('command:*', () => {
    console.error(colors.cyan('Invalid action provided: %s.'), program.args.join(' '));
    console.error('See --help for available actions.');
    process.exit(1);
});
function collectRecipient(value, collector) {
    const tuple = value.split('@');
    if (tuple.length !== 2)
        collector.push(undefined);
    else
        collector.push(tuple);
    return collector;
}
function buildTransferOp(toPKH, amount, fee) {
    return {
        kind: 'transaction',
        fee,
        gas_limit: '200',
        storage_limit: '0',
        amount,
        destination: toPKH
    };
}
program
    .command('forgeBatchTransfer')
    .description('forge a batch transfer to many recipients')
    .option('-n, --node <URI>', 'Tezos node URI')
    .option('-f, --fromSK <key>', 'Sender secret key')
    .option('-r, --recipient <hash>@<mutez>', 'A recipient in the batch', collectRecipient, [])
    .option('-p, --fee <mutez>', 'Operation fee per recipient in mutez')
    .option('-m, --timeout <sec>', 'Timeout in seconds for request', parseInt)
    .action(tryRunning(async (options) => {
    if (!options.node)
        throw new Error('No Tezos node provided.');
    if (!options.fromSK)
        throw new Error('No sender SK provided.');
    if (options.recipient.length <= 0)
        throw new Error('No recipients provided.');
    if (options.recipient.indexOf(undefined) !== -1)
        throw new Error('Malformed recipient(s).');
    const recipients = options.recipient;
    if (!options.fee)
        throw new Error('No fee provided.');
    if (!options.timeout)
        throw new Error('No timeout provided.');
    eztz_js_1.eztz.node.setProvider(options.node);
    const keys = eztz_js_1.eztz.crypto.extractKeys(options.fromSK);
    const secretKey = keys.sk;
    keys.sk = false; // Short-circuits the injection after forge.
    const transferOps = recipients.map(([toPKH, amount]) => buildTransferOp(toPKH, amount, options.fee));
    // Usually a bad request will fail instantly, but we timeout all requests as a precaution.
    const forgeResult = await promise_timeout_1.timeout(eztz_js_1.eztz.rpc.sendOperation(keys.pkh, transferOps, keys), options.timeout * 1000);
    let signResult = eztz_js_1.eztz.crypto.sign(forgeResult.opbytes, secretKey, eztz_js_1.eztz.watermark.generic);
    forgeResult.opOb.signature = signResult.edsig;
    console.log(colors.green('Transfer forged with the following bytes and object:'));
    console.log(signResult.sbytes);
    console.log(JSON.stringify(forgeResult.opOb));
}));
program
    .command('extract')
    .description('get the public key hash for a secret')
    .option('-s, --secret <key>', 'Secret key')
    .action(tryRunning(async (options) => {
    if (!options.secret)
        throw new Error('No secret key provided.');
    const keys = eztz_js_1.eztz.crypto.extractKeys(options.secret);
    if (!keys.pkh)
        throw new Error('Extraction failed on a bad secret key.');
    console.log(colors.green('Extracted the following public key hash:'));
    console.log(keys.pkh);
}));
program
    .command('inject')
    .description('pre-validate and inject an operation')
    .option('-n, --node <URI>', 'Tezos node URI')
    .option('-s, --signed <bytes>', 'Signed operation bytes')
    .option('-o, --object <JSON>', 'Serialized operation object')
    .option('-m, --timeout <sec>', 'Timeout in seconds for request', parseInt)
    .action(tryRunning(async (options) => {
    if (!options.node)
        throw new Error('No Tezos node provided.');
    if (!options.signed)
        throw new Error('No signed operation bytes provided.');
    if (!options.object)
        throw new Error('No operation object provided.');
    if (!options.timeout)
        throw new Error('No timeout provided.');
    eztz_js_1.eztz.node.setProvider(options.node);
    const object = JSON.parse(options.object);
    const injectResult = await promise_timeout_1.timeout(eztz_js_1.eztz.rpc.inject(object, options.signed), options.timeout * 1000);
    console.log(colors.green('Injected operation with hash:'));
    console.log(injectResult.hash);
}));
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error(colors.cyan('No action provided.'));
    console.error('See --help for available actions.');
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXp0ei1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXp0ei1zaW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFFdkMsaUNBQWdDO0FBQ2hDLHFDQUFvQztBQUVwQyxxQ0FBOEI7QUFDOUIscURBQXlDO0FBcUJ6Qyw2RkFBNkY7QUFDN0Ysb0dBQW9HO0FBQ3BHLG1FQUFtRTtBQUNuRSxTQUFTLFdBQVcsQ0FBRSxLQUFVO0lBQzlCLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUE7SUFDM0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQTtJQUNqRSxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUU7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDakMsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLFNBQVM7WUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBOztZQUMvRCxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0tBQ3ZDO1NBQU07UUFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsQ0FBQyxDQUFBO1FBQ3JFLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7S0FDdkM7SUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUM7QUFFRCxTQUFTLFVB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