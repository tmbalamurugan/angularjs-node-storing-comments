const db = require('../../controller/common/mongoose-model')
    , Q = require("q");

const GetDocument = (model, query, projection) => {
    const defer = Q.defer();
    const Query = db[model].find(query, projection);
    Query.exec((err, docs) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(docs);
        }
    });
    return defer.promise;
};

const GetOneDocument = (model, query, projection) => {
    const defer = Q.defer();
    const Query = db[model].findOne(query, projection);
    Query.exec((err, docs) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(docs);
        }
    });
    return defer.promise;
};

const UpdateDocument = (model, criteria, doc, options) => {
    const defer = Q.defer();
    db[model].update(criteria, doc, options, (err, docs) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(docs);
        }
    });
    return defer.promise;
};

const InsertDocument = (model, docs) => {
    const defer = Q.defer();
    const new_obj = db[model](docs);
    new_obj.save((err, data) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(data);
        }
    });
    return defer.promise;
};

const GetAggregation = (model, query) => {
    const defer = Q.defer();
    db[model].aggregate(query).exec((err, docs) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(docs);
        }
    });
    return defer.promise;
};

module.exports = {
    GetDocument: GetDocument,
    GetOneDocument: GetOneDocument,
    UpdateDocument: UpdateDocument,
    InsertDocument: InsertDocument,
    GetAggregation: GetAggregation
}