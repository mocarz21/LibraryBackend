const bookshelf = require('./config/bookshelf');


exports.Books = bookshelf.Model.extend({tableName: 'ksiazki'})
exports.Users = bookshelf.Model.extend({ tableName: "czytelnicy" });
exports.Employees = bookshelf.Model.extend({ tableName: "pracownicy" });
