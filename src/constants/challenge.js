module.exports = {
  games: [
    'pubg',
    'leagueOfLegends'
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
  }
};
