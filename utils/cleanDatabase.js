let mongoose = require('mongoose');

function _ensureIndexesRecursive(modelNames, currentIndex, done) {
    if (currentIndex < modelNames.length) {
        var model = mongoose.model(modelNames[currentIndex++]);
        model.ensureIndexes(function (error) {
            if (error) {
                return done(error);
            }
            _ensureIndexesRecursive(modelNames, currentIndex, done);
        });
    }
    else {
        done();
    }
}

/**
 * drop database and ensure all indexes
 * @return promise
 */
function cleanDatabase() {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGODB_URI).then(() => {
            mongoose.connection.db.dropDatabase();
            var modelNames = mongoose.modelNames();
            _ensureIndexesRecursive(modelNames, 0, resolve);
        });
    });
}

/**
 * remove data from a collection, but do not touch index
 * @param {*} model 
 * @return promise
 */
function cleanModel(model) {
    //takes O(n) to remove from database
    //but keeps index
    //slower than drop, but whatever
    return model.remove({});
}

module.exports = {
    cleanDatabase: cleanDatabase,
    cleanModel: cleanModel
}