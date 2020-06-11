module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'architecture',
    },
    {
      type: 'doc',
      id: 'quick-start',
    },
    {
      type: 'doc',
      id: 'install',
    },
    {
      type: 'category',
      label: 'DeviceLink',
      items: ['devicelink/create-dl', 'devicelink/state-of-dl'],
    },
    {
      type: 'category',
      label: 'Device Adaptors',
      items: ['adaptors/adaptor', 'adaptors/mqtt-extension', 'adaptors/ble', 'adaptors/modbus', 'adaptors/opc-ua', 'adaptors/mqtt', 'adaptors/agent-device', 'adaptors/develop'],
    },
    {
      type: 'doc',
      id: 'monitoring',
    },
    {
      type: 'doc',
      id: 'edge-ui',
    },
    {
      type: 'doc',
      id: 'faq',
    },
    {
      type: 'doc',
      id: 'example',
    },
  ],
};
