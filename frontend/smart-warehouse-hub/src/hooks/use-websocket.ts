import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useWarehouseWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${proto}://${window.location.host}/ws/warehouse`;
    
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connect = () => {
      console.log(`📡 Connecting to Warehouse Real-time Event Channel: ${wsUrl}`);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('📡 Connected to Warehouse Real-time Event Channel successfully.');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const eventType = payload.event_type || payload.metadata?.event_type;

          console.log('🔔 Received Real-time Domain Event:', eventType, payload);

          if (eventType && typeof eventType === 'string') {
            if (eventType.startsWith('inventory.')) {
              queryClient.invalidateQueries({ queryKey: ['inventory'] });
              queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            } else if (eventType.startsWith('order.')) {
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['ordersStats'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            }
          }
        } catch (e) {
          console.warn('Failed to parse WebSocket message JSON:', e);
        }
      };

      ws.onclose = (e) => {
        console.log('🔌 Disconnected from Warehouse Event Channel. Reconnecting in 5s...', e.reason);
        reconnectTimeout = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [queryClient]);
}
export default useWarehouseWebSocket;
