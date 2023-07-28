"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRentalListingOpen = exports.isExpired = void 0;
const schemas_1 = require("@dcl/schemas");
function isExpired(rentalListing) {
    return rentalListing.expiration < Date.now();
}
exports.isExpired = isExpired;
function isRentalListingOpen(rentalListing) {
    return rentalListing.status === schemas_1.RentalStatus.OPEN;
}
exports.isRentalListingOpen = isRentalListingOpen;
