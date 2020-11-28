function getSubdomain() {
  return window.location.host.split('.')[1] ? window.location.host.split('.')[0] : false;
}

module.exports = getSubdomain;
