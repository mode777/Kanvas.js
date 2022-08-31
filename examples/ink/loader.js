var utils = require('loader-utils');
var urlToRequest = utils.urlToRequest;
var schema = require('schema-utils');
var validate = schema.validate;
var ink = require("inkjs/dist/ink-full");

var schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};

module.exports = function (source) {
    const options = this.getOptions();

    validate(schema, options, {
        name: 'Example Loader',
        baseDataPath: 'options',
    });

    var story = new ink.Compiler(source).Compile();


    return "export default " + story.ToJson();
}

// var ink = require("inkjs/dist/ink-full");
// var fs = require('fs');

// var data = fs.readFileSync('./ink/example.ink', 'utf8');

