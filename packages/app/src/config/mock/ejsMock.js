// snarkjs uses ejs which has unsafe-eval function constructor which cause CSP errors

module.exports = {
  render() {
    throw new Error("We override ejs package because it has unsafe-eval code. Check webpack configuration.");
  },
};
