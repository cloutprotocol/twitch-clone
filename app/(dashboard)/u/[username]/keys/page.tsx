import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

import { UrlCard } from "./_components/url-card";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";
import { WhitelistGuard } from "./_components/whitelist-guard";

const KeysPage = async () => {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("Stream not found");
  }

  // Get the primary wallet for the user
  const primaryWallet = self.wallets.find(wallet => wallet.isPrimary) || self.wallets[0];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Keys & URLs</h1>
        <ConnectModal />
      </div>
      
      <WhitelistGuard userWallet={primaryWallet}>
        <div className="space-y-4">
          <UrlCard value={stream.serverUrl} />
          <KeyCard value={stream.streamKey} />
        </div>
      </WhitelistGuard>
    </div>
  );
};

export default KeysPage;
