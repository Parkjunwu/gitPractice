"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const load_files_1 = require("@graphql-tools/load-files");
const merge_1 = require("@graphql-tools/merge");
const loadedTypes = (0, load_files_1.loadFilesSync)(`${__dirname}/**/*.typeDefs.*`);
const loadedResolvers = (0, load_files_1.loadFilesSync)(`${__dirname}/**/*.resolvers.*`);
exports.typeDefs = (0, merge_1.mergeTypeDefs)(loadedTypes);
exports.resolvers = (0, merge_1.mergeResolvers)(loadedResolvers);
