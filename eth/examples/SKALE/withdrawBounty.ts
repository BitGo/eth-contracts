import { BitGo } from 'bitgo';
import { getContractsFactory } from '../../../src/index';


async function sendBitGoTx(): Promise<void> {

  const bitGo = new BitGo({ env: 'prod' });
  const baseCoin = bitGo.coin('eth');
  bitGo.authenticateWithAccessToken({ accessToken: 'access token' });
  const bitGoWallet = await baseCoin.wallets().get({ id: 'wallet id' });
  const walletPassphrase = 'password';

  //parameters needed for withdrawing bounties
  const idOfValidator = 'validator id';
  const addressOfReceivingDelegator = 'token holder address';

  const proxyAddress = '0x4eE5F270572285776814e32952446e9B7Ee15C86';
  const Distributor = getContractsFactory('eth').getContract('SkaleDistributor').instance();
  Distributor.address = proxyAddress;

  /**
   * Allows token holder (delegator) to withdraw bounty from a specific validator.
   * This needs to be called per validator in order to recieve all of the bounties.
   */
  const { data, amount } = Distributor.methods().withdrawBounty.call({
    validatorId: idOfValidator,
    address: addressOfReceivingDelegator,
  });
  const transaction = await bitGoWallet.send({ data, amount, address: Distributor.address, walletPassphrase });
  console.dir(transaction);

}

sendBitGoTx();
