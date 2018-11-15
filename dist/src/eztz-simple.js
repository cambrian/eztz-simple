"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Disallowed by Nexe: #!/usr/bin/env node
require('source-map-support').install();
const colors = require("colors");
const program = require("commander");
const eztz_js_1 = require("eztz.js");
const promise_timeout_1 = require("promise-timeout");
function die(message) {
    console.error(colors.magenta(message));
    process.exit(1);
}
program
    .version('0.0.1', '-v, --version')
    .description('Tezos CLI using eztz')
    .on('command:*', () => {
    console.error('Invalid action provided: %s.\nSee --help for available actions.', program.args.join(' '));
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
            console.error('Unknown error (check your connection).');
        process.exit(1);
    }
});
program
    .parse(process.argv);
// Cannot be chained....
if (program.args.length < 1) {
    console.error('No action provided.\nSee --help for available action.', program.args.join(' '));
    process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXp0ei1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXp0ei1zaW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBMEM7QUFDMUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFFdkMsaUNBQWdDO0FBQ2hDLHFDQUFvQztBQUVwQyxxQ0FBOEI7QUFDOUIscURBQXlDO0FBRXpDLFNBQVMsR0FBRyxDQUFFLE9BQWU7SUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBVUQsT0FBTztLQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDO0tBQ2pDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztLQUNuQyxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLGlFQUFpRSxFQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakIsQ0FBQyxDQUFDLENBQUE7QUFFSixPQUFPO0tBQ0osT0FBTyxDQUFDLFVBQVUsQ0FBQztLQUNuQixXQUFXLENBQUMsNkJBQTZCLENBQUM7S0FDMUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDO0tBQzVDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsQ0FBQztLQUNqRCxNQUFNLENBQUMsb0JBQW9CLEVBQUUsMEJBQTBCLENBQUM7S0FDeEQsTUFBTSxDQUFDLHNCQUFzQixFQUFFLDZCQUE2QixDQUFDO0tBQzdELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxnQ0FBZ0MsQ0FBQztLQUM3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