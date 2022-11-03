import Tooltip from "./tooltip";
import { lighten } from "./color";
import {
  regionData,
  RegionName,
  getRegionPaths,
  getRegionColor,
  getDepartmentName,
  getRegionByDepartment,
} from "./regions";

import "./assets/style.css";
import map from "./assets/map_monochrome.svg";

const app = document.getElementById("app") as HTMLDivElement;
app.innerHTML = /* html */ `
  <header>
    <div class="header-title">
      <iconify-icon icon="mdi:map-marker"></iconify-icon>
      <h1>Listenbourg Maps</h1>
    </div>
    <div class="header-buttons">
      <a href="https://github.com/Listenbourg/Map" target="_blank">
        <iconify-icon icon="mdi:github"></iconify-icon>
      </a>
    </div>
  </header>
  <div class="svg-wrapper">
    <div class="region-name"></div>
    <object data="${map}" type="image/svg+xml"></object>
  </div>
`;

window.addEventListener("load", () => {
  const svgObject = document.querySelector("object")!.contentDocument!;
  const { setTooltip, hideTooltip } = Tooltip(
    document.querySelector("object")!,
    app.querySelector(".region-name")!
  );
  const groups = svgObject.querySelectorAll("g");
  const paths = svgObject.querySelectorAll("path");

  const regionsPaths = Object.fromEntries(
    Object.keys(regionData).map((name) => [
      name,
      getRegionPaths(svgObject, name as RegionName),
    ])
  );

  type Hovered = {
    region: RegionName;
    depID: number;
    depName: string;
  } | null;

  let hovered: Hovered = null;

  svgObject.addEventListener("mousemove", (e) => {
    let isHovered = false;
    paths.forEach((d) => {
      if (d.matches(":hover")) isHovered = true;
    });
    if (!isHovered) {
      hideTooltip();
    } else if (hovered) {
      setTooltip(e, `${hovered.depID} ${hovered.depName} (${hovered.region})`);
    }
  });

  groups.forEach((group) => {
    const path = group.querySelector("path")!;
    const groupID = Number(group.id);
    const departmentName = getDepartmentName(groupID);
    const regionName = getRegionByDepartment(groupID)!;
    const regionColor = getRegionColor(regionName as RegionName);

    path.style.transition = "fill 0.25s ease";

    path.addEventListener("mouseenter", () => {
      for (const path of regionsPaths[regionName])
        path.style.fill = regionColor;
      path.style.fill = lighten(regionColor);
      hovered = {
        region: regionName as RegionName,
        depID: groupID,
        depName: departmentName,
      };
    });

    path.addEventListener("mouseleave", () => {
      for (const path of regionsPaths[regionName]) path.style.fill = "#D6D6D6";
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
