"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Disallowed by Nexe: #!/usr/bin/env node
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
    try {
        eztz_js_1.eztz.node.setProvider(options.node);
        const keys = eztz_js_1.eztz.crypto.extractKeys(options.fromSK);
        const tezAmount = eztz_js_1.eztz.utility.totez(options.amount);
        const tezFee = eztz_js_1.eztz.utility.totez(options.fee);
        // Manually timeout the transfer since default behavior is to retry for a while on a bad URI.
        await promise_timeout_1.timeout(eztz_js_1.eztz.rpc.transfer(keys.pkh, keys, options.toPKH, tezAmount, tezFee, null), 5000);
        console.log(colors.green('Transfer successfully injected.'));
    }
    catch (error) {
        console.error(colors.red('An error occurred. Error info below:'));
        // Catch can really catch any type, although typically Error/String.
        if (error instanceof Error && error.message)
            console.error(error.message);
        else if (!(error instanceof Error))
            console.error(error);
        else
            console.error('Unknown error (check your URI/connection).');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXp0ei1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXp0ei1zaW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBMEM7QUFDMUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFFdkMsaUNBQWdDO0FBQ2hDLHFDQUFvQztBQUVwQyxxQ0FBOEI7QUFDOUIscURBQXlDO0FBRXpDLFNBQVMsR0FBRyxDQUFFLE9BQWU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBVUQsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO0tBQ2pDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztLQUNuQyxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2xGLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtJQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUMsQ0FBQyxDQUFBO0FBRUosT0FBTztLQUNKLE9BQU8sQ0FBQyxVQUFVLENBQUM7S0FDbkIsV0FBVyxDQUFDLDZCQUE2QixDQUFDO0tBQzFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQztLQUM1QyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsbUJBQW1CLENBQUM7S0FDakQsTUFBTSxDQUFDLG9CQUFvQixFQUFFLDBCQUEwQixDQUFDO0tBQ3hELE1BQU0sQ0FBQyxz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