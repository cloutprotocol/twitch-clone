"use client";

import { useHeliusToken } from "@/hooks/use-helius-token";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const DebugTokenData = () => {
  const [testAddress, setTestAddress] = useState("GeJVqzGBDhCDQqJnpXbqAdBvzK1aWTR6pMjA2Dyspump");
  const { data, loading, error } = useHeliusToken(testAddress);

  console.log(`[DebugTokenData] Helius state:`, { data, loading, error, testAddress });

  return (
    <div className="p-4 bg-background-secondary border border-border-primary rounded-lg">
      <h3 className="font-bold mb-4">Helius Token Data Debug</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            placeholder="Token address"
            className="flex-1"
          />
          <Button onClick={() => setTestAddress(testAddress + "1")}>
            Refresh
          </Button>
        </div>

        {loading && <div className="text-blue-500">Loading Helius data...</div>}
        
        {error && (
          <div className="p-2 bg-status-error/10 border border-status-error/20 rounded text-status-error">
            Error: {error}
          </div>
        )}
        
        {data && (
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {data.name}</div>
            <div><strong>Symbol:</strong> {data.symbol}</div>
            <div><strong>Decimals:</strong> {data.decimals}</div>
            <div><strong>Supply:</strong> {data.supply?.toLocaleString() || 'N/A'}</div>
            <div><strong>Logo:</strong> {data.logoURI ? 'Yes' : 'No'}</div>
            <div><strong>Last Updated:</strong> {new Date(data.lastUpdated).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
};