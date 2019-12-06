module.exports = {
  games: [
    'pubg'
  ],
  accessRules: {
    invite: 'invite',
    anyone: 'anyone'
  },
  operators: ['>', '<', '=', '>=', '<='],
  joinTypes: ['AND', 'OR', 'END'],
  paramTypes: {
    resultPlace: 'resultPlace',
    winTime: 'winTime',
    frags: 'frags'
  },
  status: {
    open: 'open',
    resolved: 'resolved',
    paid: 'paid'
  },
  order: ['totalDonations','createdAt','timeToStart','name','game']
};
