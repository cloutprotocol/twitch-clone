"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const ThumbnailDebug = () => {
    const [testResults, setTestResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-thumbnail-system');
            const data = await response.json();
            setTestResults(data);
        } catch (error) {
            console.error('Test failed:', error);
            setTestResults({ success: false, error: 'Test failed' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-run test on component mount
        runTest();
    }, []);

    if (!testResults) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🖼️ Thumbnail System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading test results...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">🖼️ Thumbnail System</h3>
                <Button
                    onClick={runTest}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                >
                    {loading ? "Testing..." : "Test Again"}
                </Button>
            </div>

            {testResults.success ? (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            System Ready
                        </span>
                    </div>

                    <div className="text-xs space-y-1">
                        {testResults.tests?.map((test: any, index: number) => (
                            <div key={index} className="flex justify-between">
                                <span>{test.test}:</span>
                                <span className="text-green-600 dark:text-green-400">{test.status}</span>
                            </div>
                        ))}
                    </div>

                    <details className="mt-3">
                        <summary className="text-xs cursor-pointer text-blue-600 dark:text-blue-400">
                            How to test thumbnails
                        </summary>
                        <div className="mt-2 text-xs space-y-1 text-gray-600 dark:text-gray-400">
                            {Object.entries(testResults.instructions || {}).map(([key, value]) => (
                                <div key={key}>• {value as string}</div>
                            ))}
                        </div>
                    </details>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            System Error
                        </span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        {testResults.error}
                    </p>
                </div>
            )}
        </div>
    );
};