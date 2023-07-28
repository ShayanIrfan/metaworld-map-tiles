"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRentalListingToTileRentalListing = void 0;
function convertRentalListingToTileRentalListing(rentalListing) {
    return {
        expiration: rentalListing.expiration,
        periods: rentalListing.periods,
    };
}
exports.convertRentalListingToTileRentalListing = convertRentalListingToTileRentalListing;
