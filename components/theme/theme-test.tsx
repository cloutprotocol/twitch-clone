"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ThemeTest() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-text-primary">Theme Test Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text Hierarchy */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">Text Hierarchy</h3>
            <p className="text-text-primary">Primary text - main content</p>
            <p className="text-text-secondary">Secondary text - descriptions</p>
            <p className="text-text-tertiary">Tertiary text - placeholders</p>
          </div>

          {/* Background Hierarchy */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">Background Hierarchy</h3>
            <div className="p-3 bg-background-primary border border-border-primary rounded">
              Primary background
            </div>
            <div className="p-3 bg-background-secondary border border-border-primary rounded">
              Secondary background
            </div>
            <div className="p-3 bg-background-tertiary border border-border-primary rounded">
              Tertiary background
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">Interactive Elements</h3>
            <div className="flex gap-2">
              <Button className="bg-interactive-primary hover:bg-interactive-hover text-text-inverse">
                Primary Button
              </Button>
              <Button variant="secondary" className="bg-interactive-secondary hover:bg-interactive-hover">
                Secondary Button
              </Button>
            </div>
          </div>

          {/* Status Colors */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">Status Colors</h3>
            <div className="flex gap-2">
              <span className="bg-status-success text-text-inverse px-2 py-1 rounded text-sm">Success</span>
              <span className="bg-status-warning text-text-inverse px-2 py-1 rounded text-sm">Warning</span>
              <span className="bg-status-error text-text-inverse px-2 py-1 rounded text-sm">Error</span>
              <span className="bg-status-info text-text-inverse px-2 py-1 rounded text-sm">Info</span>
            </div>
          </div>

          {/* Streaming Specific */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">Streaming Colors</h3>
            <div className="flex gap-2">
              <span className="bg-streaming-live text-text-inverse px-2 py-1 rounded text-sm">LIVE</span>
              <span className="bg-streaming-offline text-text-inverse px-2 py-1 rounded text-sm">OFFLINE</span>
              <span className="text-streaming-viewer">👁 1.2K viewers</span>
            </div>
          </div>

          {/* Overlay Example */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">Overlay Example</h3>
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded overflow-hidden">
              <div className="absolute bottom-2 right-2 bg-background-overlay rounded-full px-3 py-1 text-text-inverse text-sm backdrop-blur-sm">
                Stream Overlay
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}