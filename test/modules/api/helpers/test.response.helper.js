const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

module.exports = {
  isError: (res, status) => {
    res.should.have.status(status);
    res.should.be.json;
    res.body.should.be.a('object');
    res.body.should.not.have.property('result');
    res.body.should.have.property('error');
  },
  isSuccess: (res) => {
    try {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('result');
      res.body.should.not.have.property('error');
    } catch (error) {
      throw new Error(res.error.text);
    }
  }
};
