const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

// Configure chai
chai.use(chaiHttp);
chai.should();

const assert = chai.assert;

it("should redirect / to chatsList/ and to login/", function(done) {
  chai.request(app).get("/").end(function(err, res) {
    console.log(err, res);
  })
})