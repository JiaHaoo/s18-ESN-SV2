var mongoose = require('mongoose');
var Guide = require('../models/guide.js');
var validation = require('../utils/validations');

function getGuides(offset, limit, query, tags) {
    var findArgument = {};
    if (query) {
        findArgument = { $text: { $search: query } };
    } else if (tags) {
        findArgument = { tags: { $in: tags } };
    }
    return Promise.all([
        Guide
            .find(findArgument)
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit)
            .populate({ path: 'sender', select: ['username', 'displayname'] })
            .exec(),
        Guide
            .find(findArgument)
            .count()
            .exec()
    ]).then((values) => {

        return Promise.resolve({
            guides: values[0],
            count: values[1]
        });
    });
}

function createGuide(user, title, content, tags) {
    if (!validation.guideTitleIsOK(title)) {
        return Promise.reject({ name: 'InvalidTitleError', message: title + ' is not a valid title' });
    }
    tags = tags.split(",");
    tags = tags.map(function (tag) {
        return tag.trim();
    });
    return (new Guide({
        sender: user,
        title: title,
        content: content,
        timestamp: new Date(),
        tags: tags
    })).save();
}

function getGuideCountAndTags() {
    return Guide.find()
        .exec()
        .then((guides) => {
            tagsDict = {};
            guides.forEach(guide => {
                guide.tags.forEach(tag => {
                    if (tag in tagsDict) {
                        tagsDict[tag] += 1;
                    } else {
                        tagsDict[tag] = 1;
                    }
                });
            });
            var items = Object.keys(tagsDict).map(function (key) {
                return [key, tagsDict[key]];
            });
            items.sort(function (first, second) {
                return second[1] - first[1];
            });
            items = items.slice(0, 10);
            tags = [];
            items.forEach(item => {
                tags.push(item[0]);
            });
            return Promise.resolve({
                count: guides.length,
                tags: tags
            });
        });
}

module.exports = {
    getGuides: getGuides,
    createGuide: createGuide,
    getGuideCountAndTags: getGuideCountAndTags
}