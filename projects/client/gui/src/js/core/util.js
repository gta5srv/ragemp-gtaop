

function getCfg () {
  return window.OPPOSING_FORCES ? window.OPPOSING_FORCES : {};
}


function isDemo () {
  return getCfg().isProduction === false;
}


module.exports = {
  isDemo
};
