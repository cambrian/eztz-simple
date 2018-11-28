#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const colors = require("colors");
const program = require("commander");
const eztz_js_1 = require("eztz.js");
const promise_timeout_1 = require("promise-timeout");
function die(message) {
    console.error(colors.cyan(message));
    process.exit(1);
}
function handleError(error) {
    console.error(colors.red('An error occurred. Error info below:'));
    // Catch can really catch any type, although typically Error/String.
    if (error instanceof Error && error.message)
        console.error(error.message);
    else if (!(error instanceof Error) && error !== '')
        console.error(error);
    else
        console.error('Unknown error (check the URI and connection).');
    process.exit(1);
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
function makeTransfer(toPKH, amount, fee) {
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
    .option('-m, --timeout [sec]', 'Timeout in seconds for request', parseInt)
    .action(async (options) => {
    if (!options.node)
        die('No Tezos node provided.');
    if (!options.fromSK)
        die('No sender SK provided.');
    if (options.recipient.length <= 0)
        die('No recipients provided.');
    if (options.recipient.indexOf(undefined) !== -1)
        die('Malformed recipient(s).');
    const recipients = options.recipient;
    if (!options.fee)
        die('No fee provided.');
    if (!options.timeout) {
        console.log('Using default timeout (5 seconds).');
        options.timeout = 5;
    }
    try {
        eztz_js_1.eztz.node.setProvider(options.node);
        const keys = eztz_js_1.eztz.crypto.extractKeys(options.fromSK);
        const secretKey = keys.sk;
        keys.sk = false; // Short-circuits the injection after forge.
        const transferOps = recipients.map(([toPKH, amount]) => makeTransfer(toPKH, amount, options.fee));
        // Usually a bad request will fail instantly, but we timeout all requests as a precaution.
        const forgeResult = await promise_timeout_1.timeout(eztz_js_1.eztz.rpc.sendOperation(keys.pkh, transferOps, keys), options.timeout * 1000);
        let signResult = eztz_js_1.eztz.crypto.sign(forgeResult.opbytes, secretKey, eztz_js_1.eztz.watermark.generic);
        // TODO: Pre-validate forged operation (will require some modification to EZTZ).
        console.log(colors.green('Transfer forged with the following signed contents:'));
        console.log(signResult.sbytes);
    }
    catch (error) {
        handleError(error);
    }
});
program
    .command('extract')
    .description('get the public key hash for a secret')
    .option('-n, --node <URI>', 'Tezos node URI')
    .option('-s, --secret <key>', 'Secret key')
    .action(async (options) => {
    if (!options.node)
        die('No Tezos node provided.');
    if (!options.secret)
        die('No secret key provided.');
    try {
        eztz_js_1.eztz.node.setProvider(options.node);
        const keys = eztz_js_1.eztz.crypto.extractKeys(options.secret);
        if (!keys.pkh)
            throw new Error('Extraction failed on a bad secret key.');
        console.log(colors.green('Extracted the following public key hash:'));
        console.log(keys.pkh);
    }
    catch (error) {
        handleError(error);
    }
});
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error(colors.cyan('No action provided.'));
    console.error('See --help for available actions.');
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXp0ei1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXp0ei1zaW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFFdkMsaUNBQWdDO0FBQ2hDLHFDQUFvQztBQUVwQyxxQ0FBOEI7QUFDOUIscURBQXlDO0FBRXpDLFNBQVMsR0FBRyxDQUFFLE9BQWU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBY0QsU0FBUyxXQUFXLENBQUUsS0FBVTtJQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLG9FQUFvRTtJQUNwRSxJQUFJLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU87UUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNwRSxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7UUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBOztRQUNuRSxPQUFPLENBQUMsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUE7SUFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBRUQsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO0tBQ2pDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztLQUNuQyxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0s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