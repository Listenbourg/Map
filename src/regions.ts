import regionData_ from './assets/regions.json';

export const regionData = regionData_;

export type RegionName = keyof typeof regionData;

export function getRegionPaths(
  svg: Document,
  region: RegionName
): SVGPathElement[] {
  return regionData[region].departments
    .map(([id]) => svg.getElementById(String(id))?.querySelector('path'))
    .filter((path) => path !== undefined) as SVGPathElement[];
}

/**
 * Function to get the color of a given region
 */
export function getRegionColor(regionName: RegionName) {
  return regionData[regionName].color;
}

/**
 * Returns the name of a department given its ID
 */
export function getDepartmentName(id: number): string {
  for (const [, { departments }] of Object.entries(regionData))
    for (const department of departments)
      if (department[0] === id) return department[1] as string;
  console.error('No department found for id "' + id + '"');
  return '';
}

/**
 * Function to get the region of a given departement number
 */
export function getRegionByDepartment(id: number) {
  for (const [name, { departments }] of Object.entries(regionData))
    if (departments.map((d) => d[0]).includes(id)) return name;
  console.error('No region found for department "' + id + '"');
  return '';
}
