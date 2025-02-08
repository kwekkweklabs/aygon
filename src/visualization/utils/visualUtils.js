export const getHealthBarData = (hp) => {
  const barLength = 20;
  const filled = Math.floor((hp / 100) * barLength);
  return {
      filled,
      empty: barLength - filled,
      percentage: hp
  };
};

export const getSpecialMeterData = (meter) => {
  const barLength = 10;
  const filled = Math.floor((meter / 100) * barLength);
  return {
      filled,
      empty: barLength - filled,
      percentage: meter
  };
};

export const formatActionText = (action, attacker, defender) => {
  return {
      title: `${attacker.name} uses ${action.type}!`,
      description: action.text,
      damage: {
          amount: action.damage,
          type: action.crit ? 'CRITICAL' : action.miss ? 'GLANCING' : 'NORMAL'
      }
  };
};