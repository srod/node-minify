/**
 * JavaScript
 */
const oneFile = `${__dirname}/fixtures/es5/fixture-1.js`;
const oneFileWithoutPath = "fixture-1.js";
const oneFileWithWildcards = `${__dirname}/fixtures/es5/**/*.js`;
const filesArray = [
    `${__dirname}/fixtures/es5/fixture-1.js`,
    `${__dirname}/fixtures/es5/fixture-2.js`,
];
const filesArrayWithoutPath = ["fixture-1.js", "fixture-2.js"];
const filesArrayWithWildcards = ["fixture-1.js", "fixture-2.js", "**/*.js"];
const filesArrayWithWildcards2 = [
    `${__dirname}/fixtures/es5/fixture-1.js`,
    `${__dirname}/fixtures/es5/fixture-2.js`,
    `${__dirname}/fixtures/es5/**/*.js`,
];
const babelrc = `${__dirname}/fixtures/.babelrc`;
const errors = `${__dirname}/fixtures/js-errors/**/*.js`;
const publicFolderES5 = `${__dirname}/fixtures/es5/`;
const fileJSOut = `${__dirname}/tmp/fixture-output-1.js`;
const fileJSOutReplace = `${__dirname}/tmp/$1.js`;
const fileJSOutReplacePublicFolder = "$1.js";
const contentJS = `var tools = true; if(tools){ console.log('true'); }`;

export const filesJS = {
    oneFile,
    oneFileWithoutPath,
    oneFileWithWildcards,
    filesArray,
    filesArrayWithoutPath,
    filesArrayWithWildcards,
    filesArrayWithWildcards2,
    babelrc,
    errors,
    publicFolderES5,
    fileJSOut,
    fileJSOutReplace,
    fileJSOutReplacePublicFolder,
    contentJS,
};

/**
 * CSS
 */
const fileCSS = `${__dirname}/fixtures/css/fixture-1.css`;
const fileCSSSourceMaps = `${__dirname}/fixtures/css/fixture-1.map`;
const fileCSSWithoutPath = "fixture-1.css";
const fileCSSWithWildcards = `${__dirname}/fixtures/css/**/*.css`;
const fileCSSArray = [
    `${__dirname}/fixtures/css/fixture-1.css`,
    `${__dirname}/fixtures/css/fixture-2.css`,
];
const fileCSSArrayWithoutPath = ["fixture-1.css", "fixture-2.css"];
const fileCSSArrayWithWildcards = [
    "fixture-1.css",
    "fixture-2.css",
    "**/*.css",
];
const fileCSSArrayWithWildcards2 = [
    `${__dirname}/fixtures/css/fixture-1.css`,
    `${__dirname}/fixtures/css/fixture-2.css`,
    `${__dirname}/fixtures/css/**/*.css`,
];
const fileCSSErrors = `${__dirname}/fixtures/css-errors/**/*.css`;
const publicFolderCSS = `${__dirname}/fixtures/css/`;
const fileCSSOut = `${__dirname}/tmp/fixture-output-1.css`;
const contentCSS = ".foo { display: block; margin-left: 0; margin-right: 0; }";

export const filesCSS = {
    fileCSS,
    fileCSSSourceMaps,
    fileCSSWithoutPath,
    fileCSSWithWildcards,
    fileCSSArray,
    fileCSSArrayWithoutPath,
    fileCSSArrayWithWildcards,
    fileCSSArrayWithWildcards2,
    publicFolderCSS,
    fileCSSOut,
    fileCSSErrors,
    contentCSS,
};

/**
 * HTML
 */
const oneFileHTML = `${__dirname}/fixtures/html/fixture-1.html`;
const oneFileHTMLWithoutPath = "fixture-1.html";
const fileHTMLWithWildcards = `${__dirname}/fixtures/html/**/*.html`;
const filesHTMLArray = [
    `${__dirname}/fixtures/html/fixture-1.html`,
    `${__dirname}/fixtures/html/fixture-2.html`,
];
const filesHTMLArrayWithoutPath = ["fixture-1.html", "fixture-2.html"];
const filesHTMLArrayWithWildcards = [
    `${__dirname}/fixtures/html/fixture-1.html`,
    `${__dirname}/fixtures/html/fixture-2.html`,
    `${__dirname}/fixtures/html/**/*.html`,
];
const filesHTMLArrayWithWildcards2 = [
    "fixture-1.html",
    "fixture-2.html",
    "**/*.html",
];
const publicFolderHTML = `${__dirname}/fixtures/html/`;
const fileHTMLOut = `${__dirname}/tmp/fixture-1.min.html`;
const fileHTMLOutReplace = `${__dirname}/tmp/$1.html`;
const fileHTMLOutReplacePublicFolder = "$1.html";
const contentHTML = `<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>`;

export const filesHTML = {
    oneFileHTML,
    oneFileHTMLWithoutPath,
    fileHTMLWithWildcards,
    filesHTMLArray,
    filesHTMLArrayWithoutPath,
    filesHTMLArrayWithWildcards,
    filesHTMLArrayWithWildcards2,
    publicFolderHTML,
    fileHTMLOut,
    fileHTMLOutReplace,
    fileHTMLOutReplacePublicFolder,
    contentHTML,
};

/**
 * JSON
 */
const oneFileJSON = `${__dirname}/fixtures/json/fixture-1.json`;
const oneFileJSONWithoutPath = "fixture-1.json";
const fileJSONWithWildcards = `${__dirname}/fixtures/json/**/*.json`;
const filesJSONArray = [
    `${__dirname}/fixtures/json/fixture-1.json`,
    `${__dirname}/fixtures/json/fixture-2.json`,
];
const filesJSONArrayWithoutPath = ["fixture-1.json", "fixture-2.json"];
const filesJSONArrayWithWildcards = [
    `${__dirname}/fixtures/json/fixture-1.json`,
    `${__dirname}/fixtures/json/fixture-2.json`,
    `${__dirname}/fixtures/json/**/*.json`,
];
const filesJSONArrayWithWildcards2 = [
    "fixture-1.json",
    "fixture-2.json",
    "**/*.json",
];
const publicFolderJSON = `${__dirname}/fixtures/json/`;
const fileJSONOut = `${__dirname}/tmp/fixture-1.min.json`;
const fileJSONOutReplace = `${__dirname}/tmp/$1.json`;
const fileJSONOutReplacePublicFolder = "$1.json";
const contentJSON = `[
  {
    "item1": "item1"
  },
    {
    "item2": "item2"
  }
]`;

export const filesJSON = {
    oneFileJSON,
    oneFileJSONWithoutPath,
    fileJSONWithWildcards,
    filesJSONArray,
    filesJSONArrayWithoutPath,
    filesJSONArrayWithWildcards,
    filesJSONArrayWithWildcards2,
    publicFolderJSON,
    fileJSONOut,
    fileJSONOutReplace,
    fileJSONOutReplacePublicFolder,
    contentJSON,
};
