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
    .option('-f, --fromSK <key>', 'sender secret key')
    .option('-t, --toPKH <hash>', 'receiver public key hash')
    .option('-a, --amount <value>', 'amount to transfer in mutez')
    .option('-p, --fee <value>', 'desired operation fee in mutez')
    .option('-m, --timeout [sec]', 'timeout in seconds for request', parseInt)
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
});
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error(colors.cyan('No action provided.'));
    console.error('See --help for available actions.');
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXp0ei1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXp0ei1zaW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFFdkMsaUNBQWdDO0FBQ2hDLHFDQUFvQztBQUVwQyxxQ0FBOEI7QUFDOUIscURBQXlDO0FBRXpDLFNBQVMsR0FBRyxDQUFFLE9BQWU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBZUQsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO0tBQ2pDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztLQUNuQyxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2xGLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtJQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUMsQ0FBQyxDQUFBO0FBRUosT0FBTztLQUNKLE9BQU8sQ0FBQyxVQUFVLENBQUM7S0FDbkIsV0FBVyxDQUFDLDZCQUE2QixDQUFDO0tBQzFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQztLQUM1QyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsbUJBQW1CLENBQUM7S0FDakQsTUFBTSxDQUFDLG9CQUFvQixFQUFFLDBCQUEwQixDQUFDO0tBQ3hELE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSw2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