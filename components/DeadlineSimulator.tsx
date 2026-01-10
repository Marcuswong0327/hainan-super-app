import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { simulateDeadlineCheck } from '../DeadlineSimulator.tsx';

export function DeadlineSimulator() {
  const [simulated, setSimulated] = useState(false);

  const handleSimulate = () => {
    simulateDeadlineCheck();
    setSimulated(true);
    setTimeout(() => setSimulated(false), 3000);
  };

  return (
    <Card className="border-yellow-300 bg-yellow-50">
      <CardHeader className="border-b border-yellow-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">Deadline Simulator (Testing Only)</CardTitle>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          This tool simulates payment deadline checks for testing. Will be removed in production.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Click the button below to simulate overdue payment notifications. This will send notifications to:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>All users with active loans</li>
            <li>All Sub Admins</li>
            <li>All Super Admins</li>
          </ul>
          <Button
            onClick={handleSimulate}
            variant="outline"
            className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-100"
          >
            <Clock className="w-4 h-4 mr-2" />
            {simulated ? 'Notifications Sent!' : 'Simulate Deadline Check'}
          </Button>
          {simulated && (
            <p className="text-xs text-green-600 text-center">
              ✓ Notifications have been sent. Check the notification bell icon.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
