"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leftMerge = exports.getTokenIdFromNftId = exports.isNftIdFromEstate = exports.isNftIdFromParcel = void 0;
/** Checks whether a NFT ID belong to a parcel.
 * @param nftId A NFT ID
 */
function isNftIdFromParcel(nftId) {
    return nftId.startsWith('parcel');
}
exports.isNftIdFromParcel = isNftIdFromParcel;
/** Checks whether a NFT ID belong to an estate.
 * @param nftId A NFT ID
 */
function isNftIdFromEstate(nftId) {
    return nftId.startsWith('estate');
}
exports.isNftIdFromEstate = isNftIdFromEstate;
/** Gets the token id from a NFT ID by retrieving the latest section of it.
 * @param nftId A NFT ID
 */
function getTokenIdFromNftId(nftId) {
    return nftId.split('-')[2];
}
exports.getTokenIdFromNftId = getTokenIdFromNftId;
/** Performs a left merge of an array, removing duplicates by id, favouring the items on the right array.
 * @param leftItems An array of items
 * @param rightItems An array of items
 */
function leftMerge(leftItems, rightItems) {
    const result = leftItems.reduce((prev, current) => ({ ...prev, [current.id]: current }), {});
    rightItems.forEach((item) => {
        result[item.id] = item;
    });
    return Object.values(result);
}
exports.leftMerge = leftMerge;
