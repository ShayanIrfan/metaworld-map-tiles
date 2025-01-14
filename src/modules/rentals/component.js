"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRentalsComponent = void 0;
const p_limit_1 = __importDefault(require("p-limit"));
const schemas_1 = require("@dcl/schemas");
const HTTP_MAX_URL_LENGTH = 2048;
const MAX_CONCURRENT_REQUEST = 2;
const LIMIT_RENTAL_LISTINGS = 100;
async function createRentalsComponent(components) {
    const { config, fetch: fetchComponent, logger } = components;
    const componentLogger = logger.getLogger('Rentals component');
    const signaturesServerURL = await config.requireString('SIGNATURES_SERVER_URL');
    /** Gets the rental listings from the given path.
     * @param path The signatures' server path to be used when querying rental listings.
     * @throws An error if the request fails.
     */
    async function fetchRentalListings(path) {
        const response = await fetchComponent.fetch(`${signaturesServerURL}${path}`, {
            headers: {
                'User-agent': 'Atlas server',
            },
        });
        if (!response.ok) {
            let parsedErrorResult;
            try {
                parsedErrorResult = await response.json();
            }
            catch (_) {
                // Ignore the JSON parse result error error.
            }
            if (parsedErrorResult) {
                throw new Error(parsedErrorResult.message);
            }
            throw new Error(`Error fetching rentals, the server responded with: ${response.status}`);
        }
        const parsedResult = await response.json();
        if (!parsedResult.ok) {
            throw new Error(parsedResult.message);
        }
        return parsedResult;
    }
    /** Gets the open rental listings of the NFTs identified by the given NFT ids.
     * @param nftIds The ids of the NFTs to get the rental listings for.
     * @throws An error if the request fails.
     */
    async function getRentalsListingsOfNFTs(nftIds) {
        const baseUrl = `/v1/rentals-listings?rentalStatus=${schemas_1.RentalStatus.OPEN}`;
        const limit = (0, p_limit_1.default)(MAX_CONCURRENT_REQUEST);
        componentLogger.info(`Getting rental listings for ${nftIds.length} NFTs`);
        // Build URLs to get all the queried NFTs
        let urls = [];
        let url = baseUrl;
        for (let nftId of nftIds) {
            if (url.length < HTTP_MAX_URL_LENGTH - signaturesServerURL.length) {
                url += `&nftIds=${nftId}`;
            }
            else {
                urls.push(url);
                url = baseUrl + `&nftIds=${nftId}`;
            }
        }
        // Push the last url
        if (url !== baseUrl) {
            urls.push(url);
        }
        const results = await Promise.all(urls.map((url, i) => limit(() => {
            componentLogger.info(`Rental listings request ${i}: ${url}`);
            return fetchRentalListings(url).catch((error) => {
                limit.clearQueue();
                throw error;
            });
        })));
        componentLogger.info(`Finished to get the NFTs rental listings`);
        return (results
            .flatMap((result) => result.data.results)
            // Although no returned rental should be null or undefined, there have been cases where the rental listing was not accessible
            // this is a temporary change to see if the access problems were related to retrieved rental listings
            .filter(Boolean)
            .reduce((rentalListings, rentalListing) => {
            return {
                ...rentalListings,
                [rentalListing.nftId]: rentalListing,
            };
        }, {}));
    }
    /** Gets the updated rental listings that were updated after the given date.
     * @param updatedAfter A UTC timestamp in milliseconds of the rental listings update time.
     * @throws An error if the request fails.
     */
    async function getUpdatedRentalListings(updatedAfter) {
        let remainingRentalListings = 0;
        let rentalListings = [];
        componentLogger.info(`Starting to fetch the updated rental listings`);
        do {
            componentLogger.info(`Requesting rental listings: /v1/rentals-listings?updatedAfter=${updatedAfter}&limit=${LIMIT_RENTAL_LISTINGS}&offset=${rentalListings.length}`);
            const updatedRentalListings = await fetchRentalListings(`/v1/rentals-listings?updatedAfter=${updatedAfter}&limit=${LIMIT_RENTAL_LISTINGS}&offset=${rentalListings.length}`);
            rentalListings = rentalListings.concat(updatedRentalListings.data.results);
            remainingRentalListings =
                updatedRentalListings.data.total - rentalListings.length;
        } while (remainingRentalListings > 0);
        componentLogger.info(`Finished to fetch the updated rental listings`);
        // Although no returned rental should be null or undefined, there have been cases where the rental listing was not accessible
        // this is a temporary change to see if the access problems were related to retrieved rental listings
        return rentalListings.filter(Boolean);
    }
    return {
        getRentalsListingsOfNFTs,
        getUpdatedRentalListings,
    };
}
exports.createRentalsComponent = createRentalsComponent;
