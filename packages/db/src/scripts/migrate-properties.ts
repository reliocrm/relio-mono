import mongoose from "mongoose";
import dotenv from "dotenv";
import {
	Property,
	PropertyLocation,
	PropertyPhysicalDetails,
	PropertyFinancials,
	PropertyMLS,
	PropertyUnitMix,
	PropertySaleHistory,
	LinkedProperty,
} from "../models/property.model.js";

dotenv.config();

// Connection URIs
const OLD_DB_URI = "mongodb+srv://pbdb:pWGNE5ip2bGr8QuT@pb-prod.q10qd.mongodb.net/propbear?retryWrites=true&w=majority";
const NEW_DB_URI = process.env.DATABASE_URL || "mongodb+srv://bobbyalv:tbhATPOQJoyo5FeH@relio.q10qd.mongodb.net/dev?retryWrites=true&w=majority&appName=Relio";

interface OldProperty {
	_id: mongoose.Types.ObjectId;
	name?: string;
	recordType?: string;
	coverImage?: string;
	status?: string;
	tags?: any[];
	type?: string;
	subType?: string;
	submarket?: string;
	zillowListingID?: string;
	creator?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
	deletedBy?: mongoose.Types.ObjectId;
	lastViewedAt?: Date;
	lastViewedBy?: mongoose.Types.ObjectId;
	isDeleted?: boolean;
	deletedDate?: Date;
	createdAt?: Date;
	updatedAt?: Date;
	team?: mongoose.Types.ObjectId;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: number;
	county?: string;
	coordinates?: {
		lat?: number;
		lng?: number;
	};
	owner?: mongoose.Types.ObjectId;
	propertyData?: {
		lastSold?: string;
		soldPrice?: number;
		yearBuilt?: number | string;
		yearRenov?: number;
		address?: string;
		SQFT?: number;
		usableSqft?: number;
		vacantSqft?: number;
		floors?: number;
		usablePercentage?: number;
		vacantPercentage?: number;
		acres?: number | string;
		condition?: string;
		lot?: number;
		lotType?: string;
		parking?: string;
		parcelNo?: string;
		foundation?: string;
		construction?: string;
		propertyValue?: string;
		bathroom?: number | string;
		bedroom?: number | string;
		family?: string;
		stories?: string | number;
		units?: number;
		occupancy?: string;
		buildingStatus?: string;
		buildingType?: string;
		style?: string;
		forsale?: {
			sale?: boolean;
			price?: string;
			escrow?: boolean;
			status?: string;
			listingPrice?: string;
			listingDate?: string;
			listingAgent?: string;
			listingAgentPhone?: string;
			listingAgentEmail?: string;
			listingAgentURL?: string;
			cap?: number;
			grm?: number;
			dollarPerSqFt?: number;
			dollarPerUnit?: number | string;
		};
		mostrecentsale?: {
			price?: string;
			date?: string;
			cap?: number;
			grm?: number;
			dollarPerSqFt?: number;
			dollarPerUnit?: number;
			listingAgent?: string;
			sellingAgent?: string;
			saleSeller?: string;
			saleBuyer?: string;
			lender?: string;
			referral?: string;
			daysOnMarket?: number;
		};
		unitMixes?: Array<{
			unitType?: string;
			beds?: string;
			bath?: string;
			noUnits?: string;
			unitMinSqft?: string;
			unitMaxSqft?: string;
			unitMinPrice?: string;
			unitMaxPrice?: string;
			unitMinRent?: string;
			unitMaxRent?: string;
		}>;
		meterType?: string;
		zoning?: string;
		class?: string;
		structures?: string;
		landType?: string;
		landValue?: number | string;
		bldgValue?: number | string;
		tract?: string;
		improvements?: string;
	};
	propertyImages?: Array<{ url?: string; key?: string }>;
	docs?: Array<{
		url?: string;
		key?: string;
		type?: string;
		icon?: string;
		name?: string;
	}>;
}

// Helper function to convert string to number safely
function toNumber(value: string | number | undefined | null): number | undefined {
	if (value === undefined || value === null || value === "") return undefined;
	if (typeof value === "number") return value;
	const parsed = Number(value);
	return isNaN(parsed) ? undefined : parsed;
}

// Helper function to convert string to Date safely
function toDate(value: string | Date | undefined | null): Date | undefined {
	if (value === undefined || value === null || value === "") return undefined;
	if (value instanceof Date) return value;
	const parsed = new Date(value);
	return isNaN(parsed.getTime()) ? undefined : parsed;
}

async function migrateProperties() {
	let oldConnection: mongoose.Connection | null = null;
	let newConnection: mongoose.Connection | null = null;

	try {
		console.log("Connecting to old database...");
		oldConnection = mongoose.createConnection(OLD_DB_URI);
		await new Promise<void>((resolve, reject) => {
			oldConnection!.once('connected', resolve);
			oldConnection!.once('error', reject);
		});
		console.log("✓ Connected to old database");

		console.log("Connecting to new database...");
		newConnection = mongoose.createConnection(NEW_DB_URI);
		await new Promise<void>((resolve, reject) => {
			newConnection!.once('connected', resolve);
			newConnection!.once('error', reject);
		});
		console.log("✓ Connected to new database");

		// List all collections to find the property collection
		console.log("Listing all collections in old database...");
		if (!oldConnection || !oldConnection.db) throw new Error("Failed to connect to old database");
		const collections = await oldConnection.db.listCollections().toArray();
		const collectionNames = collections.map((c: any) => c.name);
		console.log("Available collections:", collectionNames);

		// Try various possible collection names
		const possibleCollections = [
			"propertydetails",
			"PropertyDetails",
			"properties",
			"Properties",
			"property",
			"Property"
		];
		
		let oldCollection = null;
		for (const collName of possibleCollections) {
			try {
				if (!oldConnection.db) break;
				const collection = oldConnection.db.collection(collName);
				const count = await collection.countDocuments();
				if (count > 0) {
					console.log(`✓ Found collection: ${collName} with ${count} documents`);
					oldCollection = collection;
					break;
				}
			} catch (e: any) {
				// Collection might not exist, try next
				console.log(`  Collection ${collName} not found or empty`);
			}
		}
		
		if (!oldCollection && oldConnection.db) {
			// Try to find any collection that might contain properties
			console.log("\nSearching for property-related collections...");
			for (const collName of collectionNames) {
				const lowerName = collName.toLowerCase();
				if (lowerName.includes("propert") || lowerName.includes("realestate") || lowerName.includes("listing")) {
					try {
						const collection = oldConnection.db.collection(collName);
						const count = await collection.countDocuments();
						if (count > 0) {
							console.log(`✓ Found potential property collection: ${collName} with ${count} documents`);
							// Check if it has property-like fields
							const sample = await collection.findOne({});
							if (sample && (sample.name || sample.address || sample.propertyData)) {
								console.log(`  ✓ Confirmed: ${collName} appears to be a property collection`);
								oldCollection = collection;
								break;
							}
						}
					} catch (e) {
						// Continue searching
					}
				}
			}
		}
		
		if (!oldCollection) {
			throw new Error(
				`Could not find property collection in old database.\n` +
				`Available collections: ${collectionNames.join(", ")}\n` +
				`Please check the collection name and update the script if needed.`
			);
		}

		// Get models from new connection
		if (!newConnection) throw new Error("Failed to connect to new database");
		const NewPropertyModel = newConnection.model("Property", Property.schema);
		const NewPropertyLocationModel = newConnection.model("PropertyLocation", PropertyLocation.schema);
		const NewPropertyPhysicalDetailsModel = newConnection.model("PropertyPhysicalDetails", PropertyPhysicalDetails.schema);
		const NewPropertyFinancialsModel = newConnection.model("PropertyFinancials", PropertyFinancials.schema);
		const NewPropertyMLSModel = newConnection.model("PropertyMLS", PropertyMLS.schema);
		const NewPropertyUnitMixModel = newConnection.model("PropertyUnitMix", PropertyUnitMix.schema);
		const NewPropertySaleHistoryModel = newConnection.model("PropertySaleHistory", PropertySaleHistory.schema);
		const NewLinkedPropertyModel = newConnection.model("LinkedProperty", LinkedProperty.schema);

		// Also get the propertydatas collection if it exists (for nested PropertyData)
		let propertyDataCollection = null;
		if (oldConnection.db) {
			try {
				propertyDataCollection = oldConnection.db.collection("propertydatas");
				const dataCount = await propertyDataCollection.countDocuments();
				if (dataCount > 0) {
					console.log(`✓ Found propertydatas collection with ${dataCount} documents`);
				} else {
					propertyDataCollection = null;
				}
			} catch (e) {
				// Collection doesn't exist, that's okay
				console.log("  propertydatas collection not found (PropertyData may be embedded)");
			}
		}

		// Filter by specific organization IDs (team IDs)
		const allowedOrganizationIds = [
			new mongoose.Types.ObjectId("628bff8d44cd3e01b746b737"),
			new mongoose.Types.ObjectId("628ea3ebfeec685660394d1c"),
		];
		
		console.log("Fetching properties from old database for specific organizations...");
		console.log(`  Organization IDs: ${allowedOrganizationIds.map(id => id.toString()).join(", ")}`);
		
		const oldProperties = await oldCollection.find({
			team: { $in: allowedOrganizationIds }
		}).toArray();
		
		console.log(`Found ${oldProperties.length} properties to migrate`);

		let successCount = 0;
		let errorCount = 0;
		const errors: Array<{ _id: string; error: string }> = [];

		for (const oldProp of oldProperties) {
			try {
				const oldProperty = oldProp as unknown as OldProperty;
				// Convert _id to ObjectId if needed
				const propertyId = oldProperty._id instanceof mongoose.Types.ObjectId 
					? oldProperty._id 
					: new mongoose.Types.ObjectId(String(oldProperty._id));

				console.log(`\nMigrating property: ${oldProperty.name || propertyId.toString()}`);

				// If PropertyData is a reference (ObjectId), fetch it from propertydatas collection
				let propertyData = oldProperty.propertyData;
				if (!propertyData && (oldProperty as any).PropertyData && propertyDataCollection) {
					const propertyDataId = (oldProperty as any).PropertyData;
					if (propertyDataId) {
						try {
							const pdId = propertyDataId instanceof mongoose.Types.ObjectId 
								? propertyDataId 
								: new mongoose.Types.ObjectId(String(propertyDataId));
							const fetchedData = await propertyDataCollection.findOne({ _id: pdId });
							if (fetchedData) {
								propertyData = fetchedData as any;
								console.log(`  ✓ Fetched PropertyData from propertydatas collection`);
							}
						} catch (e) {
							console.log(`  ⚠ Could not fetch PropertyData: ${e}`);
						}
					}
				}

				// Convert ObjectIds for relationships
				const organizationId = oldProperty.team 
					? (oldProperty.team instanceof mongoose.Types.ObjectId 
						? oldProperty.team 
						: new mongoose.Types.ObjectId(String(oldProperty.team)))
					: undefined;

				// Skip if no organizationId (required in new schema)
				if (!organizationId) {
					console.log(`⚠ Skipping property ${propertyId} - no organizationId (team) found`);
					errorCount++;
					errors.push({ _id: propertyId.toString(), error: "Missing organizationId (team)" });
					continue;
				}
				const createdBy = oldProperty.creator 
					? (oldProperty.creator instanceof mongoose.Types.ObjectId 
						? oldProperty.creator 
						: new mongoose.Types.ObjectId(String(oldProperty.creator)))
					: undefined;
				const updatedBy = oldProperty.updatedBy 
					? (oldProperty.updatedBy instanceof mongoose.Types.ObjectId 
						? oldProperty.updatedBy 
						: new mongoose.Types.ObjectId(String(oldProperty.updatedBy)))
					: undefined;
				const deletedBy = oldProperty.deletedBy 
					? (oldProperty.deletedBy instanceof mongoose.Types.ObjectId 
						? oldProperty.deletedBy 
						: new mongoose.Types.ObjectId(String(oldProperty.deletedBy)))
					: undefined;
				const lastViewedBy = oldProperty.lastViewedBy 
					? (oldProperty.lastViewedBy instanceof mongoose.Types.ObjectId 
						? oldProperty.lastViewedBy 
						: new mongoose.Types.ObjectId(String(oldProperty.lastViewedBy)))
					: undefined;

				// Map main Property document (organizationId is required)
				// Note: objectTags, location, physicalDetails, financials, etc. are stored in separate collections
				const newPropertyData: any = {
					_id: propertyId,
					name: oldProperty.name || "Untitled Property",
					recordType: oldProperty.recordType || "property",
					image: oldProperty.coverImage,
					organizationId: organizationId,
					propertyType: oldProperty.type,
					propertySubType: oldProperty.subType,
					subMarket: oldProperty.submarket,
					listingId: oldProperty.zillowListingID,
					status: oldProperty.status,
					createdBy: createdBy,
					updatedBy: updatedBy,
					lastViewedAt: oldProperty.lastViewedAt,
					lastViewedBy: lastViewedBy,
					isDeleted: oldProperty.isDeleted || false,
					deletedAt: oldProperty.deletedDate,
					deletedBy: deletedBy,
					createdAt: oldProperty.createdAt || new Date(),
					updatedAt: oldProperty.updatedAt || new Date(),
				};

				// Create or update Property
				await NewPropertyModel.findOneAndUpdate(
					{ _id: propertyId },
					newPropertyData,
					{ upsert: true, new: true }
				);

				// Map PropertyLocation
				// Coordinates might be in PropertyData or directly in the property
				const coordinates = oldProperty.coordinates || (propertyData as any)?.coordinates;
				
				if (oldProperty.address || oldProperty.city || oldProperty.state || oldProperty.zipCode || coordinates) {
					const locationData: any = {
						propertyId: propertyId,
						address: {
							street: oldProperty.address,
							city: oldProperty.city,
							state: oldProperty.state,
							zipCode: oldProperty.zipCode,
							full: oldProperty.address
								? `${oldProperty.address}${oldProperty.city ? `, ${oldProperty.city}` : ""}${oldProperty.state ? `, ${oldProperty.state}` : ""} ${oldProperty.zipCode || ""}`.trim()
								: undefined,
						},
						location: coordinates
							? {
									type: "Point",
									coordinates: [coordinates.lng || 0, coordinates.lat || 0],
								}
							: undefined,
						county: oldProperty.county,
						parcelNumber: propertyData?.parcelNo,
						zoning: propertyData?.zoning,
						createdAt: oldProperty.createdAt || new Date(),
						updatedAt: oldProperty.updatedAt || new Date(),
					};

					await NewPropertyLocationModel.findOneAndUpdate(
						{ propertyId: propertyId },
						locationData,
						{ upsert: true, new: true }
					);
				}

				// Map PropertyPhysicalDetails
				if (propertyData) {
					const pd = propertyData;
					const physicalData: any = {
						propertyId: propertyId,
						yearBuilt: toNumber(pd.yearBuilt),
						squareFootage: toNumber(pd.SQFT),
						units: toNumber(pd.units),
						floors: toNumber(pd.floors),
						bedrooms: toNumber(pd.bedroom),
						bathrooms: toNumber(pd.bathroom),
						lotSize: toNumber(pd.lot),
						lotAcres: toNumber(pd.acres),
						lotType: pd.lotType,
						construction: pd.construction,
						class: pd.class,
						parking: pd.parking,
						meterType: pd.meterType,
						structures: toNumber(pd.structures),
						createdAt: oldProperty.createdAt || new Date(),
						updatedAt: oldProperty.updatedAt || new Date(),
					};

					await NewPropertyPhysicalDetailsModel.findOneAndUpdate(
						{ propertyId: propertyId },
						physicalData,
						{ upsert: true, new: true }
					);
				}

				// Map PropertyFinancials
				if (propertyData) {
					const pd = propertyData;
					const financialsData: any = {
						propertyId: propertyId,
						price: pd.forsale?.price ? toNumber(pd.forsale.price) : undefined,
						salePrice: toNumber(pd.soldPrice),
						saleDate: pd.lastSold ? toDate(pd.lastSold) : undefined,
						lastSalePrice: pd.mostrecentsale?.price ? toNumber(pd.mostrecentsale.price) : undefined,
						lastSaleDate: pd.mostrecentsale?.date ? toDate(pd.mostrecentsale.date) : undefined,
						landValue: pd.landValue ? toNumber(pd.landValue) : undefined,
						buildingValue: pd.bldgValue ? toNumber(pd.bldgValue) : undefined,
						cap: pd.forsale?.cap || pd.mostrecentsale?.cap,
						pricePerSquareFoot: pd.forsale?.dollarPerSqFt || pd.mostrecentsale?.dollarPerSqFt,
						createdAt: oldProperty.createdAt || new Date(),
						updatedAt: oldProperty.updatedAt || new Date(),
					};

					await NewPropertyFinancialsModel.findOneAndUpdate(
						{ propertyId: propertyId },
						financialsData,
						{ upsert: true, new: true }
					);
				}

				// Map PropertyMLS
				if (propertyData?.forsale && organizationId) {
					const fs = propertyData.forsale;
					const mlsData: any = {
						propertyId: propertyId,
						organizationId: organizationId,
						mlsListingPrice: fs.listingPrice ? toNumber(fs.listingPrice) : undefined,
						mlsListingDate: fs.listingDate,
						mlsStatus: fs.status,
						createdAt: oldProperty.createdAt || new Date(),
						updatedAt: oldProperty.updatedAt || new Date(),
					};

					await NewPropertyMLSModel.findOneAndUpdate(
						{ propertyId: propertyId },
						mlsData,
						{ upsert: true, new: true }
					);
				}

				// Map PropertySaleHistory
				if (propertyData?.mostrecentsale && organizationId) {
					const mrs = propertyData.mostrecentsale;
					const saleHistoryData: any = {
						propertyId: propertyId,
						organizationId: organizationId,
						seller: mrs.saleSeller,
						buyer: mrs.saleBuyer,
						saleDate: mrs.date ? toDate(mrs.date) : undefined,
						salePrice: mrs.price ? toNumber(mrs.price) : undefined,
						pricePerSquareFoot: mrs.dollarPerSqFt,
						pricePerUnit: mrs.dollarPerUnit,
						capRate: mrs.cap,
						grmRate: mrs.grm,
						createdAt: oldProperty.createdAt || new Date(),
						updatedAt: oldProperty.updatedAt || new Date(),
					};

					await NewPropertySaleHistoryModel.create(saleHistoryData);
				}

				// Map PropertyUnitMix
				if (propertyData?.unitMixes && organizationId) {
					for (const unitMix of propertyData.unitMixes) {
						const unitMixData: any = {
							propertyId: propertyId,
							organizationId: organizationId,
							name: unitMix.unitType || "Unit Mix",
							units: unitMix.noUnits ? toNumber(unitMix.noUnits) : undefined,
							minSquareFootage: unitMix.unitMinSqft ? toNumber(unitMix.unitMinSqft) : undefined,
							maxSquareFootage: unitMix.unitMaxSqft ? toNumber(unitMix.unitMaxSqft) : undefined,
							minPrice: unitMix.unitMinPrice ? toNumber(unitMix.unitMinPrice) : undefined,
							maxPrice: unitMix.unitMaxPrice ? toNumber(unitMix.unitMaxPrice) : undefined,
							minRent: unitMix.unitMinRent ? toNumber(unitMix.unitMinRent) : undefined,
							maxRent: unitMix.unitMaxRent ? toNumber(unitMix.unitMaxRent) : undefined,
							createdAt: oldProperty.createdAt || new Date(),
							updatedAt: oldProperty.updatedAt || new Date(),
						};

						await NewPropertyUnitMixModel.create(unitMixData);
					}
				}

				// Map LinkedProperty for owner relationship
				if (oldProperty.owner && organizationId) {
					// Convert owner to ObjectId if needed
					const ownerId = oldProperty.owner instanceof mongoose.Types.ObjectId 
						? oldProperty.owner 
						: new mongoose.Types.ObjectId(String(oldProperty.owner));
					
					const linkedPropertyData: any = {
						relation: "owner",
						contactId: ownerId,
						propertyId: propertyId,
						organizationId: organizationId,
						createdAt: oldProperty.createdAt || new Date(),
						updatedAt: oldProperty.updatedAt || new Date(),
						createdBy: createdBy,
						updatedBy: updatedBy,
					};

					await NewLinkedPropertyModel.findOneAndUpdate(
						{ contactId: ownerId, propertyId: propertyId, relation: "owner" },
						linkedPropertyData,
						{ upsert: true, new: true }
					);
				}

				successCount++;
				console.log(`✓ Successfully migrated property ${propertyId}`);
			} catch (error: any) {
				errorCount++;
				const errorMsg = error.message || String(error);
				console.error(`✗ Error migrating property ${oldProp._id}:`, errorMsg);
				errors.push({ _id: oldProp._id.toString(), error: errorMsg });
			}
		}

		console.log("\n" + "=".repeat(60));
		console.log("Migration Summary:");
		console.log(`Total properties: ${oldProperties.length}`);
		console.log(`Successfully migrated: ${successCount}`);
		console.log(`Errors: ${errorCount}`);
		if (errors.length > 0) {
			console.log("\nErrors:");
			errors.forEach((err) => {
				console.log(`  - ${err._id}: ${err.error}`);
			});
		}
		console.log("=".repeat(60));
	} catch (error) {
		console.error("Fatal error during migration:", error);
		throw error;
	} finally {
		if (oldConnection) {
			await oldConnection.close();
			console.log("Closed old database connection");
		}
		if (newConnection) {
			await newConnection.close();
			console.log("Closed new database connection");
		}
	}
}

// Run migration
migrateProperties()
	.then(() => {
		console.log("\nMigration completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\nMigration failed:", error);
		process.exit(1);
	});

