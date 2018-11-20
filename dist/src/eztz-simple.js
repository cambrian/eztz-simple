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
program
    .command('transfer')
    .description('move funds between accounts')
    .option('-n, --node <URI>', 'Tezos node URI')
    .option('-f, --fromSK <key>', 'Sender secret key')
    .option('-t, --toPKH <hash>', 'Receiver public key hash')
    .option('-a, --amount <value>', 'Amount to transfer in mutez')
    .option('-p, --fee <value>', 'Desired operation fee in mutez')
    .option('-m, --timeout [sec]', 'Timeout in seconds for request', parseInt)
    .action(async (options) => {
    if (!options.node)
        die('No Tezos node provided.');
    if (!options.fromSK)
        die('No sender SK provided.');
    if (!options.toPKH)
        die('No receiver PKH provided.');
    if (!options.amount)
        die('No amount provided.');
    if (!options.fee)
        die('No fee provided.');
    if (!options.timeout) {
        console.log('Using default timeout (5 seconds).');
        options.timeout = 5;
    }
    try {
        eztz_js_1.eztz.node.setProvider(options.node);
        const keys = eztz_js_1.eztz.crypto.extractKeys(options.fromSK);
        const tezAmount = eztz_js_1.eztz.utility.totez(options.amount);
        const tezFee = eztz_js_1.eztz.utility.totez(options.fee);
        // Usually a bad request will fail instantly, but we timeout all requests as a precaution.
        const result = await promise_timeout_1.timeout(eztz_js_1.eztz.rpc.transfer(keys.pkh, keys, options.toPKH, tezAmount, tezFee, null), options.timeout * 1000);
        console.log(colors.green('Transfer injected with the following hash:'));
        console.log(result.hash);
    }
    catch (error) {
        handleError(error);
    }
});
program
    .command('extract')
    .description('get public key hash for a secret')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXp0ei1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXp0ei1zaW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFFdkMsaUNBQWdDO0FBQ2hDLHFDQUFvQztBQUVwQyxxQ0FBOEI7QUFDOUIscURBQXlDO0FBRXpDLFNBQVMsR0FBRyxDQUFFLE9BQWU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBZ0JELFNBQVMsV0FBVyxDQUFFLEtBQVU7SUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQTtJQUNqRSxvRUFBb0U7SUFDcEUsSUFBSSxLQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPO1FBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDcEUsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO1FBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTs7UUFDbkUsT0FBTyxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFBO0lBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakIsQ0FBQztBQUVELE9BQU87S0FDSixPQUFPLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztLQUNqQyxXQUFXLENBQUMsc0JBQXNCLENBQUM7S0FDbkMsRUFBRSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7SUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFN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