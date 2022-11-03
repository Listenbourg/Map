import "./style.css";
import map from "./map_monochrome.svg";
import regionData from "./regions.json";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>Listenbourg</h1>
  <div class="region-name"></div>
	<object data="${map}"
		type="image/svg+xml">
	</object>
`;

type RegionName = keyof typeof regionData;

/**
 * Function to get the color of a given region
 */
function getRegionColor(regionName: RegionName) {
  return regionData[regionName].color;
}

function getDepartmentName(id: number): string {
  for (const [, { departments }] of Object.entries(regionData))
    for (const department of departments)
      if (department[0] === id) return department[1] as string;
  return "";
}

/**
 * Function to get the region of a given departement number
 */
function getRegion(id: number) {
  for (const [name, { departments }] of Object.entries(regionData))
    if (departments.map((d) => d[0]).includes(id)) return name;
  return undefined;
}

function setActiveRegion(regionName: RegionName, svgObject: Document) {
  let regionColor = getRegionColor(regionName as RegionName);
  for (const department of regionData[regionName].departments) {
    let departmentGroup = svgObject.getElementById(String(department[0]));
    let departmentPath = departmentGroup?.querySelector("path");

    if (departmentPath) {
      departmentPath.style.fill = regionColor;
    }
  }
}

function setInactiveRegion(regionName: RegionName, svgObject: Document) {
  for (const department of regionData[regionName].departments) {
    let departmentGroup = svgObject.getElementById(String(department[0]));
    let departmentPath = departmentGroup?.querySelector("path");

    if (departmentPath) {
      departmentPath.style.fill = "#D6D6D6";
    }
  }
}

function toggleTooltip(
  e: MouseEvent,
  regionName: string,
  departmentName: string
) {
  let tooltip = document.querySelector(".region-name") as HTMLDivElement;
  tooltip.innerHTML = `${departmentName} (${regionName})`;
  tooltip.style.left = e.pageX + 225 + "px";
  tooltip.style.top = e.pageY + 25 + "px";
  tooltip.style.display = "block";
}

/**
 * Function to get a lighten color of given
 */
function lighten(color: string) {
  let r = Math.min(
    255,
    Math.round(parseInt(color.substring(1, 3), 16) * 1.2)
  ).toString(16);
  let g = Math.min(
    255,
    Math.round(parseInt(color.substring(3, 5), 16) * 1.2)
  ).toString(16);
  let b = Math.min(
    255,
    Math.round(parseInt(color.substring(5, 7), 16) * 1.2)
  ).toString(16);
  r = r.length == 1 ? "0" + r : r;
  g = g.length == 1 ? "0" + g : g;
  b = b.length == 1 ? "0" + b : b;
  return "#" + r + g + b;
}

window.addEventListener("load", () => {
  const svgObject = document.querySelector("object")!.contentDocument!;
  const departments = svgObject.querySelectorAll("g");
  const regionNameDiv = document.querySelector(
    ".region-name"
  ) as HTMLDivElement;

  let hoveredRegion: RegionName | undefined = undefined;
  let hoveredDepartment: string | undefined = undefined;

  svgObject.addEventListener("mousemove", (e) => {
    let hovered = false;
    departments.forEach((d) => {
      if (d.querySelector("path")!.matches(":hover")) hovered = true;
    });
    if (!hovered) {
      regionNameDiv.style.display = "none";
    } else if (hoveredRegion && hoveredDepartment) {
      toggleTooltip(e, hoveredRegion, hoveredDepartment);
    }
  });

  departments.forEach((departement) => {
    const path = departement.querySelector("path")!;
    const departmentName = getDepartmentName(parseInt(departement.id));
    const regionName = getRegion(parseInt(departement.id))!;
    const regionColor = getRegionColor(regionName as RegionName);

    path.style.transition = "fill 0.25s ease";

    path.addEventListener("mouseenter", () => {
      setActiveRegion(regionName as RegionName, svgObject);
      path.style.fill = lighten(regionColor);
      hoveredRegion = regionName as RegionName;
      hoveredDepartment = departmentName;
    });

    path.addEventListener("mouseleave", () => {
      setInactiveRegion(regionName as RegionName, svgObject);
    });

    path.addEventListener("click", () => {
      regionNameDiv.innerHTML = `${departmentName} (${regionName})`;
    });
  });
});

// Ressources :
// https://www.petercollingridge.co.uk/tutorials/svg/interactive/javascript/

// Gérer différents espaces : régions / départements ✓

// Gérer les infos liées aux régions <====

// Gérer l'affichage d'un point pour les villes

// Gérer le fait de sélectionner une ville

// Afficher les infos d'une ville

// Afficher les routes principales (réseau routier autoroutes, train)

// Afficher des lieux spéciaux (aéroport...)
