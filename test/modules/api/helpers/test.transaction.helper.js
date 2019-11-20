const firstTx = {
  'ref_block_num': 27117,
  'ref_block_prefix': 1741405489,
  'expiration': '2019-07-16T14:39:20',
  'operations': [
    [
      0,
      {
        'fee': {
          'amount': '2000000',
          'asset_id': '1.3.0'
        },
        'from': '1.2.67',
        'to': '1.2.57',
        'amount': {
          'amount': '10000000',
          'asset_id': '1.3.0'
        },
        'extensions': []
      }
    ]
  ],
  'extensions': [],
  'signatures': [
    '2063a8dd0aae292484bc0669de260becd0680bc4eb7c8f7243e949608658b578192c3da777c9a96f1f9afa62c5dfedb36b0a7140817c77a73f8ab2c01e629c2864'
  ]
};

const secondTx = {
  'ref_block_num': 41835,
  'ref_block_prefix': 1023123521,
  'expiration': '2019-07-19T10:13:05',
  'operations': [
    [
      0,
      {
        'fee': {
          'amount': '2000000',
          'asset_id': '1.3.0'
        },
        'from': '1.2.67',
        'to': '1.2.57',
        'amount': {
          'amount': '10000000',
          'asset_id': '1.3.0'
        },
        'extensions': []
      }
    ]
  ],
  'extensions': [],
  'signatures': [
    '1f0839b642142d00a8e26e459d34ab7c61df9289f98b683e4837d6d65e3a38fab005720c909ef9aa7bdc7f0f0f9ebe05d7adcbd191a3be7c3523c013dfa1255a7b'
  ]
};

module.exports = {firstTx, secondTx};
