const {getNetwork, getWarp, getContractTxId, loadWallet} = require("./utils");

(async () => {
    const warp = getWarp();
    const [wallet, walletAddress] = await loadWallet(warp);

    let targetWallet;
    if (warp.environment === 'testnet' || warp.environment === 'local') {
        targetWallet = await  warp.testing.generateWallet();
    } else {
        targetWallet = await warp.arweave.wallets.generate();
    }
    const targetAddress = await warp.arweave.wallets.getAddress(targetWallet);

    const erc20 = warp.contract(getContractTxId(warp.environment)).connect(wallet);
    const erc20FromTarget = warp.contract(getContractTxId(warp.environment)).connect(targetWallet);


    const approveId = await erc20.writeInteraction(
       { function: "approve", spender: targetAddress, amount: 1},
       {strict: true}
        );

    console.log('Approve tx id', approveId);

    const transferResponse = await erc20FromTarget.writeInteraction({
        function: "transferFrom",
        from: walletAddress,
        to: targetAddress,
        amount: 1
        },
        {strict: true}
    );
    console.log('Transfer From tx id: ', transferResponse.originalTxId);
})();
