import type { Company } from "@/types/company";

export interface BranchOption {
  id: string;
  name: string;
  address: string;
  companySlug: string;
  companyName: string;
}

function collator(locale: string): Intl.Collator {
  return new Intl.Collator(locale, { sensitivity: "base" });
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function branchOptionsFromCompanies(
  companies: Company[],
  locale: string,
): BranchOption[] {
  const compare = collator(locale);
  return companies
    .filter((company) => company.vehicleCount !== 0)
    .flatMap((company) =>
      company.branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        companySlug: company.slug,
        companyName: company.name,
      })),
    )
    .sort(
      (a, b) =>
        compare.compare(a.name, b.name) ||
        compare.compare(a.companyName, b.companyName),
    );
}

export function filterBranchOptions(
  options: BranchOption[],
  query: string,
): BranchOption[] {
  const needle = normalize(query.trim());
  if (!needle) {
    return options;
  }
  return options.filter((option) =>
    [option.name, option.address, option.companyName].some((field) =>
      normalize(field).includes(needle),
    ),
  );
}

export function companyForBranch(
  companies: Company[],
  branchId: string | undefined,
): Company | undefined {
  if (!branchId) {
    return undefined;
  }
  return companies.find((company) =>
    company.branches.some((branch) => branch.id === branchId),
  );
}

export function returnBranchOptions(
  company: Company | undefined,
): BranchOption[] {
  if (!company?.allowDifferentReturn || company.branches.length < 2) {
    return [];
  }
  return company.branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
    companySlug: company.slug,
    companyName: company.name,
  }));
}
