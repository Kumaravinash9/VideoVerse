function onSocketPreError(error) {
  console.log(error);
}

function onSocketPostError(error) {
  console.log(error);
}

module.exports = {
  onSocketPostError,
  onSocketPreError,
};
