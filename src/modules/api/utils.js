"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParcelFragmentRentalListing = exports.buildFromEstates = exports.capitalize = exports.getProximity = exports.isExpired = void 0;
const rentals_1 = require("../../adapters/rentals");
const nfts_1 = require("../../logic/nfts");
const rental_1 = require("../../logic/rental");
const proximity_json_1 = __importDefault(require("./data/proximity.json"));
function isExpired(order) {
    return parseInt(order.expiresAt) <= Math.round(Date.now() / 1000);
}
exports.isExpired = isExpired;
const getProximity = (coords) => {
    let proximity;
    for (const { x, y } of coords) {
        const id = x + ',' + y;
        const coordProximity = proximity_json_1.default[id];
        if (coordProximity) {
            if (proximity === undefined) {
                proximity = {};
            }
            if (coordProximity.district !== undefined &&
                (proximity.district === undefined ||
                    coordProximity.district < proximity.district)) {
                proximity.district = coordProximity.district;
            }
            if (coordProximity.plaza !== undefined &&
                (proximity.plaza === undefined ||
                    coordProximity.plaza < proximity.plaza)) {
                proximity.plaza = coordProximity.plaza;
            }
            if (coordProximity.road !== undefined &&
                (proximity.road === undefined || coordProximity.road < proximity.road)) {
                proximity.road = coordProximity.road;
            }
        }
    }
    return proximity;
};
exports.getProximity = getProximity;
function capitalize(text) {
    return text[0].toUpperCase() + text.slice(1);
}
exports.capitalize = capitalize;
function buildFromEstates(estates, list, build) {
    // keep track of entries already added to the list
    const alreadyAdded = new Set(list.map((entry) => entry.id));
    // fill list with new entries from EstateFragments
    return estates.reduce((entries, nft) => 
    // grab parcels from each estate
    nft.estate.parcels
        // build each entry from each ParcelFragment
        .map((parcel) => build(parcel.nft))
        // add entries to the list, only if not null and not added already
        .reduce((entries, entry) => {
        if (entry && !alreadyAdded.has(entry.id)) {
            entries.push(entry);
            alreadyAdded.add(entry.id);
        }
        return entries;
    }, entries), []);
}
exports.buildFromEstates = buildFromEstates;
function getParcelFragmentRentalListing(parcel, newRentalListings, oldTilesByTokenId) {
    const nftId = parcel.searchParcelEstateId ?? parcel.id;
    const tokenId = (0, nfts_1.getTokenIdFromNftId)(nftId);
    if (newRentalListings[nftId]) {
        return newRentalListings[nftId] &&
            (0, rental_1.isRentalListingOpen)(newRentalListings[nftId])
            ? (0, rentals_1.convertRentalListingToTileRentalListing)(newRentalListings[nftId])
            : undefined;
    }
    else if (tokenId &&
        oldTilesByTokenId[tokenId] &&
        oldTilesByTokenId[tokenId].rentalListing) {
        return oldTilesByTokenId[parcel.id].rentalListing;
    }
    return undefined;
}
exports.getParcelFragmentRentalListing = getParcelFragmentRentalListing;
