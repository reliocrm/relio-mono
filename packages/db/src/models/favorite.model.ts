import mongoose from "mongoose";
const { Schema, model } = mongoose;

const favoriteSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    objectId: { type: Schema.Types.ObjectId, required: true },
    objectType: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    folderId: { type: Schema.Types.ObjectId, ref: "FavoriteFolder" },
    position: { type: Number },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "favorite",
    indexes: [
      { fields: { organizationId: 1, userId: 1 }, options: { name: "by_organization_user" } },
      { fields: { objectId: 1 }, options: { name: "by_object" } }
    ]
  }
);

const favoriteFolderSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isOpen: { type: Boolean },
    position: { type: Number },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "favorite_folder",
    indexes: [
      { fields: { organizationId: 1, userId: 1 }, options: { name: "by_organization_user" } }
    ]
  }
);

const Favorite = model("Favorite", favoriteSchema);
const FavoriteFolder = model("FavoriteFolder", favoriteFolderSchema);

export { Favorite, FavoriteFolder };
