const express = require('express');
var bcrypt = require('bcrypt');

const security = {};

security.salt = function(userpassword){
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(userpassword, salt);

    return hash;
}

security.compare = function(hash, password){
    if (bcrypt.compareSync(password, hash)){
        return true;
    }

    return false;
}

module.exports = security;