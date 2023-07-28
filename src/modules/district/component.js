"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDistrictComponent = void 0;
const districts_json_1 = __importDefault(require("./data/districts.json"));
const contributions_json_1 = __importDefault(require("./data/contributions.json"));
const districts = districts_json_1.default;
const contributions = contributions_json_1.default;
function createDistrictComponent() {
    return {
        getDistricts: () => districts,
        getDistrict: (id) => districts.find((district) => district.id === id) || null,
        getContributionsByAddress: (address) => contributions[address] || [],
    };
}
exports.createDistrictComponent = createDistrictComponent;
