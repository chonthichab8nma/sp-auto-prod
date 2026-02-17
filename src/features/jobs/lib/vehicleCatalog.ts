import type {
  VehicleBrandApi,
  VehicleModelApi,
} from "../services/vehicles.service";

export function normalizeCatalogKey(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function findBrandByName(
  brands: VehicleBrandApi[],
  brandName?: string | null,
): VehicleBrandApi | undefined {
  const normalizedBrandName = normalizeCatalogKey(brandName);
  if (!normalizedBrandName) return undefined;

  return brands.find((brand) => {
    const keys = [
      normalizeCatalogKey(brand.name),
      normalizeCatalogKey(brand.nameEn),
      normalizeCatalogKey(brand.code),
    ];
    return keys.includes(normalizedBrandName);
  });
}

export function resolveBrandLogoUrl(
  brands: VehicleBrandApi[],
  brandName?: string | null,
): string | null {
  return findBrandByName(brands, brandName)?.logoUrl ?? null;
}

export function findModelByName(
  brand: VehicleBrandApi | undefined,
  modelName?: string | null,
): VehicleModelApi | undefined {
  const normalizedModelName = normalizeCatalogKey(modelName);
  if (!brand || !normalizedModelName) return undefined;
  return brand.models?.find(
    (model) => normalizeCatalogKey(model.name) === normalizedModelName,
  );
}

export function resolveVehicleTypeFromCatalog(
  brands: VehicleBrandApi[],
  brandName?: string | null,
  modelName?: string | null,
): string {
  const matchedBrand = findBrandByName(brands, brandName);
  const matchedModel = findModelByName(matchedBrand, modelName);
  return matchedModel?.type?.name ?? "";
}
