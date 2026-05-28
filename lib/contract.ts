export const FanBridgeRegistryAbi = [
  {
    type: 'function',
    name: 'register',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'predict',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'string' },
      { name: 'pick', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'registered',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'totalFans',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalPredictions',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'predictionCount',
    stateMutability: 'view',
    inputs: [{ name: 'fan', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'FanRegistered',
    inputs: [
      { name: 'fan', type: 'address', indexed: true },
      { name: 'fanIndex', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PredictionMade',
    inputs: [
      { name: 'fan', type: 'address', indexed: true },
      { name: 'matchId', type: 'string', indexed: false },
      { name: 'pick', type: 'string', indexed: false },
      { name: 'predictionIndex', type: 'uint256', indexed: false },
    ],
  },
] as const
