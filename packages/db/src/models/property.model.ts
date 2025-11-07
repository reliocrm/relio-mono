import mongoose from "mongoose";

const { Schema, model } = mongoose;

const propertySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    apolloId: { type: String },
    name: { type: String, required: true },
    recordType: { type: String, default: "property" },
    image: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    propertyType: { type: String },
    propertySubType: { type: String },
    market: { type: String },
    subMarket: { type: String },
    listingId: { type: String },
    status: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastViewedAt: { type: Date },
    lastViewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "property",
    indexes: [
      { fields: { organizationId: 1 } },
      { fields: { organizationId: 1, isDeleted: 1 } },
      { fields: { organizationId: 1, createdAt: 1 } },
      { fields: { organizationId: 1, name: 1 } },
      { fields: { organizationId: 1, propertyType: 1 } },
      { fields: { organizationId: 1, status: 1 } },
    ]
  }
);

const propertyLocationSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", unique: true, required: true },
    address: { type: Schema.Types.Mixed },
    location: { type: Schema.Types.Mixed },
    website: { type: String },
    neighborhood: { type: Schema.Types.Mixed },
    county: { type: String },
    subdivision: { type: String },
    lotNumber: { type: String },
    parcelNumber: { type: String },
    zoning: { type: String },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "property_location",
    indexes: [
      { fields: { address: 1 } },
      { fields: { location: 1 } },
      { fields: { website: 1 } },
      { fields: { neighborhood: 1 } },
      { fields: { county: 1 } },
      { fields: { subdivision: 1 } },
      { fields: { lotNumber: 1 } },
      { fields: { parcelNumber: 1 } },
      { fields: { zoning: 1 } },
    ]
  }
);

const propertyPhysicalDetailsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", unique: true, required: true },
    yearBuilt: { type: Number },
    squareFootage: { type: Number },
    units: { type: Number },
    floors: { type: Number },
    structures: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    roomsCount: { type: Number },
    buildingSquareFeet: { type: Number },
    garageSquareFeet: { type: Number },
    livingSquareFeet: { type: Number },
    lotSquareFeet: { type: Number },
    lotSize: { type: Number },
    lotType: { type: String },
    lotAcres: { type: Number },
    construction: { type: String },
    primaryUse: { type: String },
    propertyUse: { type: String },
    class: { type: String },
    parking: { type: String },
    parkingSpaces: { type: Number },
    garageType: { type: String },
    heatingType: { type: String },
    meterType: { type: String },
    legalDescription: { type: String },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "property_physical_details",
    indexes: [
      { fields: { units: 1 } },
      { fields: { bedrooms: 1 } },
      { fields: { bathrooms: 1 } },
      { fields: { squareFootage: 1 } },
      { fields: { yearBuilt: 1 } },
      { fields: { lotSize: 1 } },
      { fields: { lotAcres: 1 } },
      { fields: { lotType: 1 } },
      { fields: { construction: 1 } },
      { fields: { primaryUse: 1 } },
      { fields: { heatingType: 1 } },
      { fields: { meterType: 1 } },
      { fields: { parking: 1 } },
      { fields: { parkingSpaces: 1 } },
      { fields: { garageType: 1 } },
      { fields: { garageSquareFeet: 1 } },
      { fields: { livingSquareFeet: 1 } },
      { fields: { lotSquareFeet: 1 } },
    ]
  },
);

const propertyFinancialsSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		price: { type: Number },
		estimatedValue: { type: Number },
		pricePerSquareFoot: { type: Number },
		equity: { type: Number },
		equityPercent: { type: Number },
		estimatedEquity: { type: Number },
		saleDate: { type: Date },
		salePrice: { type: Number },
		lastSalePrice: { type: Number },
		lastSaleDate: { type: Date },
		landValue: { type: Number },
		buildingValue: { type: Number },
		cap: { type: Number },
		exchange: { type: Boolean },
		exchangeId: { type: String },
		taxInfo: { type: Schema.Types.Mixed },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_financials",
		indexes: [
			{ fields: { price: 1 } },
			{ fields: { estimatedValue: 1 } },
			{ fields: { pricePerSquareFoot: 1 } },
			{ fields: { equity: 1 } },
			{ fields: { equityPercent: 1 } },
			{ fields: { saleDate: 1 } },
			{ fields: { salePrice: 1 } },
			{ fields: { lastSalePrice: 1 } },
			{ fields: { landValue: 1 } },
			{ fields: { buildingValue: 1 } },
			{ fields: { cap: 1 } },
			{ fields: { exchange: 1 } },
			{ fields: { exchangeId: 1 } },
			{ fields: { taxInfo: 1 } },
		],
	}
);

const propertyFlagsSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		absenteeOwner: { type: Boolean, default: false },
		inStateAbsenteeOwner: { type: Boolean, default: false },
		outOfStateAbsenteeOwner: { type: Boolean, default: false },
		ownerOccupied: { type: Boolean, default: false },
		corporateOwned: { type: Boolean, default: false },
		vacant: { type: Boolean, default: false },
		mobileHome: { type: Boolean, default: false },
		carport: { type: Boolean, default: false },
		auction: { type: Boolean, default: false },
		cashBuyer: { type: Boolean, default: false },
		investorBuyer: { type: Boolean, default: false },
		freeClear: { type: Boolean, default: false },
		highEquity: { type: Boolean, default: false },
		privateLender: { type: Boolean, default: false },
		deedInLieu: { type: Boolean, default: false },
		quitClaim: { type: Boolean, default: false },
		sheriffsDeed: { type: Boolean, default: false },
		warrantyDeed: { type: Boolean, default: false },
		inherited: { type: Boolean, default: false },
		spousalDeath: { type: Boolean, default: false },
		lien: { type: Boolean, default: false },
		taxLien: { type: Boolean, default: false },
		preForeclosure: { type: Boolean, default: false },
		trusteeSale: { type: Boolean, default: false },
		floodZone: { type: Boolean, default: false },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_flags",
		indexes: [
			{ fields: { absenteeOwner: 1 } },
			{ fields: { inStateAbsenteeOwner: 1 } },
			{ fields: { outOfStateAbsenteeOwner: 1 } },
			{ fields: { ownerOccupied: 1 } },
			{ fields: { corporateOwned: 1 } },
			{ fields: { vacant: 1 } },
			{ fields: { mobileHome: 1 } },
			{ fields: { carport: 1 } },
			{ fields: { auction: 1 } },
			{ fields: { cashBuyer: 1 } },
			{ fields: { investorBuyer: 1 } },
			{ fields: { freeClear: 1 } },
			{ fields: { highEquity: 1 } },
			{ fields: { privateLender: 1 } },
			{ fields: { deedInLieu: 1 } },
			{ fields: { quitClaim: 1 } },
			{ fields: { sheriffsDeed: 1 } },
			{ fields: { warrantyDeed: 1 } },
			{ fields: { inherited: 1 } },
			{ fields: { spousalDeath: 1 } },
			{ fields: { lien: 1 } },
		],
	}
);

const propertyMlsSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		mlsActive: { type: Boolean, default: false },
		mlsCancelled: { type: Boolean, default: false },
		mlsFailed: { type: Boolean, default: false },
		mlsHasPhotos: { type: Boolean, default: false },
		mlsPending: { type: Boolean, default: false },
		mlsSold: { type: Boolean, default: false },
		mlsDaysOnMarket: { type: Number },
		mlsListingPrice: { type: Number },
		mlsListingPricePerSquareFoot: { type: Number },
		mlsSoldPrice: { type: Number },
		mlsStatus: { type: String },
		mlsType: { type: String },
		mlsListingDate: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_mls",
		indexes: [
			{ fields: { mlsActive: 1 } },
			{ fields: { mlsCancelled: 1 } },
			{ fields: { mlsFailed: 1 } },
			{ fields: { mlsHasPhotos: 1 } },
			{ fields: { mlsPending: 1 } },
			{ fields: { mlsSold: 1 } },
			{ fields: { mlsDaysOnMarket: 1 } },
		]
	},
);

const propertyLegalSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", unique: true, required: true },
		floodZoneDescription: { type: String },
		floodZoneType: { type: String },
		noticeType: { type: String },
		reaId: { type: String },
		lastUpdateDate: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{ collection: "property_legal" },
);

const propertyUnitMixSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		name: { type: String, required: true },
		units: { type: Number },
		minSquareFootage: { type: Number },
		maxSquareFootage: { type: Number },
		minPrice: { type: Number },
		maxPrice: { type: Number },
		minRent: { type: Number },
		maxRent: { type: Number },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date }
	},
	{
		collection: "property_unit_mix",
		indexes: [
			{ fields: { propertyId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { units: 1 } },
			{ fields: { minSquareFootage: 1 } },
			{ fields: { maxSquareFootage: 1 } },
			{ fields: { minPrice: 1 } },
			{ fields: { maxPrice: 1 } },
			{ fields: { minRent: 1 } },
			{ fields: { maxRent: 1 } }
		]
	}
);

const propertySaleHistorySchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		seller: { type: String },
		buyer: { type: String },
		saleDate: { type: Date },
		salePrice: { type: Number },
		askingPrice: { type: Number },
		transactionType: { type: String },
		pricePerSquareFoot: { type: Number },
		pricePerUnit: { type: Number },
		transferredOwnershipPercentage: { type: Number },
		capRate: { type: Number },
		grmRate: { type: Number },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date }
	},
	{
		collection: "property_sale_history",
		indexes: [
			{ fields: { propertyId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { saleDate: 1 } },
			{ fields: { salePrice: 1 } },
			{ fields: { askingPrice: 1 } },
			{ fields: { pricePerSquareFoot: 1 } },
			{ fields: { pricePerUnit: 1 } },
			{ fields: { transferredOwnershipPercentage: 1 } }
		]
	}
);

const propertyMortgageSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		amount: { type: Number },
		assumable: { type: Boolean },
		deedType: { type: Schema.Types.Mixed },
		documentDate: { type: String },
		documentNumber: { type: Schema.Types.Mixed },
		granteeName: { type: String },
		interestRate: { type: Number },
		interestRateType: { type: String },
		lenderCode: { type: String },
		lenderName: { type: String },
		lenderType: { type: String },
		loanType: { type: String },
		loanTypeCode: { type: String },
		maturityDate: { type: String },
		mortgageId: { type: Number },
		open: { type: Boolean },
		position: { type: String },
		recordingDate: { type: String },
		seqNo: { type: Number },
		term: { type: Number },
		termType: { type: String },
		transactionType: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_mortgage",
		indexes: [
			{ fields: { propertyId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { amount: 1 } },
			{ fields: { interestRate: 1 } },
			{ fields: { lenderName: 1 } },
			{ fields: { lenderType: 1 } },
			{ fields: { loanType: 1 } },
			{ fields: { maturityDate: 1 } },
		]
	}
);

const propertyDemographicsSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", unique: true, required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		fmrEfficiency: { type: Number },
		fmrFourBedroom: { type: Number },
		fmrOneBedroom: { type: Number },
		fmrThreeBedroom: { type: Number },
		fmrTwoBedroom: { type: Number },
		fmrYear: { type: Number },
		hudAreaCode: { type: String },
		hudAreaName: { type: String },
		medianIncome: { type: Number },
		suggestedRent: { type: Number },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_demographics",
		indexes: [
			{ fields: { organizationId: 1 } },
			{ fields: { fmrEfficiency: 1 } },
			{ fields: { fmrFourBedroom: 1 } },
			{ fields: { fmrOneBedroom: 1 } },
			{ fields: { fmrThreeBedroom: 1 } },
			{ fields: { fmrTwoBedroom: 1 } },
			{ fields: { fmrYear: 1 } },
		]
	},
);

const propertyForeclosureInfoSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		foreclosureId: { type: Schema.Types.Mixed },
		originalLoanAmount: { type: Number },
		estimatedBankValue: { type: Number },
		defaultAmount: { type: Number },
		recordingDate: { type: String },
		openingBid: { type: Number },
		auctionDate: { type: String },
		auctionTime: { type: String },
		auctionStreetAddress: { type: String },
		documentType: { type: String },
		trusteeSaleNumber: { type: Schema.Types.Mixed },
		typeName: { type: String },
		active: { type: Boolean },
		lenderName: { type: String },
		lenderPhone: { type: String },
		noticeType: { type: String },
		seqNo: { type: Number },
		trusteeAddress: { type: String },
		trusteeName: { type: String },
		trusteePhone: { type: String },
		judgmentDate: { type: String },
		judgmentAmount: { type: Number },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_foreclosure_info",
		indexes: [
			{ fields: { propertyId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { foreclosureId: 1 } },
			{ fields: { originalLoanAmount: 1 } },
			{ fields: { estimatedBankValue: 1 } },
			{ fields: { defaultAmount: 1 } },
			{ fields: { recordingDate: 1 } },
			{ fields: { openingBid: 1 } },
			{ fields: { auctionDate: 1 } },
			{ fields: { auctionTime: 1 } },
			{ fields: { auctionStreetAddress: 1 } },
			{ fields: { documentType: 1 } },
			{ fields: { trusteeSaleNumber: 1 } },
			{ fields: { typeName: 1 } },
			{ fields: { active: 1 } },
			{ fields: { lenderName: 1 } },
			{ fields: { lenderPhone: 1 } },
			{ fields: { noticeType: 1 } },
			{ fields: { seqNo: 1 } },
			{ fields: { trusteeAddress: 1 } },
			{ fields: { trusteeName: 1 } },
			{ fields: { trusteePhone: 1 } },
			{ fields: { judgmentDate: 1 } },
			{ fields: { judgmentAmount: 1 } },
		]
	},
);

const propertyMlsHistorySchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		mlsId: { type: Number },
		type: { type: String },
		price: { type: Number },
		beds: { type: Number },
		baths: { type: Number },
		daysOnMarket: { type: Number },
		agentName: { type: String },
		agentOffice: { type: String },
		agentPhone: { type: String },
		agentEmail: { type: String },
		status: { type: String },
		statusDate: { type: String },
		lastStatusDate: { type: String },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "property_mls_history",
		indexes: [
			{ fields: { propertyId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { mlsId: 1 } },
			{ fields: { type: 1 } },
			{ fields: { price: 1 } },
			{ fields: { beds: 1 } },
			{ fields: { baths: 1 } },
			{ fields: { daysOnMarket: 1 } },
			{ fields: { agentName: 1 } },
			{ fields: { agentOffice: 1 } },
			{ fields: { agentPhone: 1 } },
			{ fields: { agentEmail: 1 } },
			{ fields: { status: 1 } },
			{ fields: { statusDate: 1 } },
			{ fields: { lastStatusDate: 1 } },
		]
	},
);

const linkedPropertySchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		relation: { type: String, required: true }, // e.g., "owner", "agent", etc.
		contactId: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
		propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
	},
	{
		collection: "linked_property",
		indexes: [
			{ fields: { contactId: 1 } },
			{ fields: { propertyId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { contactId: 1, propertyId: 1 } },
			{ fields: { organizationId: 1, relation: 1 } }
		]
	}
);


const Property = model("Property", propertySchema);
const PropertyLocation = model("PropertyLocation", propertyLocationSchema);
const PropertyPhysicalDetails = model("PropertyPhysicalDetails", propertyPhysicalDetailsSchema);
const PropertyFinancials = model("PropertyFinancials", propertyFinancialsSchema);
const PropertyFlags = model("PropertyFlags", propertyFlagsSchema);
const PropertyMLS = model("PropertyMLS", propertyMlsSchema);
const PropertyLegal = model("PropertyLegal", propertyLegalSchema);
const PropertyUnitMix = model("PropertyUnitMix", propertyUnitMixSchema);
const PropertySaleHistory = model("PropertySaleHistory", propertySaleHistorySchema);
const PropertyMortgage = model("PropertyMortgage", propertyMortgageSchema);
const PropertyDemographics = model("PropertyDemographics", propertyDemographicsSchema);
const PropertyForeclosureInfo = model("PropertyForeclosureInfo", propertyForeclosureInfoSchema);
const PropertyMlsHistory = model("PropertyMlsHistory", propertyMlsHistorySchema);
const LinkedProperty = model("LinkedProperty", linkedPropertySchema);

export {
	Property,
	PropertyLocation,
	PropertyPhysicalDetails,
	PropertyFinancials,
	PropertyFlags,
	PropertyMLS,
	PropertyLegal,
	PropertyUnitMix,
	PropertySaleHistory,
	PropertyMortgage,
	PropertyDemographics,
	PropertyForeclosureInfo,
	PropertyMlsHistory,
	LinkedProperty,
};


