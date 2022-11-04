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
      <h1>ListenMaps</h1>
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
  const svgEl = svgObject.querySelector("svg")!;
  const { setTooltip, hideTooltip } = Tooltip(
    document.querySelector("object")!,
    app.querySelector(".region-name")!
  );
  const groups = svgObject.querySelectorAll("g");
  const paths = svgObject.querySelectorAll("path");
  const svgDepTexts: SVGTextElement[] = [];

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

  const minZoom = 0.9;

  let hovered: Hovered = null;
  let zoom = minZoom;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  function updateTransform() {
    svgEl.style.transform = `translate(${offsetX * zoom}px, ${
      offsetY * zoom
    }px) scale(${zoom})`;
  }

  updateTransform();

  svgObject.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      const oldZoom = zoom;
      zoom = Math.max(minZoom, zoom - e.deltaY * 0.01);
      updateTransform();
      svgEl.style.cursor = zoom === minZoom ? "pointer" : "grab";

      if (zoom > 1.5 && oldZoom <= 1.5) {
        svgEl.style.setProperty('--text-display', 'block');
        hideTooltip();
      } else if (zoom <= 1.5 && oldZoom > 1.5) {
        svgEl.style.setProperty('--text-display', 'none');
      }

      svgEl.style.setProperty('--text-fz', `${Math.min(1, 1 / zoom * 2)}rem`);

      e.preventDefault();
    },
    { passive: false }
  );

  svgObject.addEventListener("mousedown", () => {
    dragging = true;
    svgEl.style.cursor = "grabbing";
  });
  svgObject.addEventListener("mouseup", () => {
    dragging = false;
    svgEl.style.cursor = zoom === minZoom ? "pointer" : "grab";
  });

  svgObject.addEventListener("mousemove", (e) => {
    let isHovered = false;
    groups.forEach((d) => {
      if (d.matches(":hover")) isHovered = true;
    });
    if (!isHovered) {
      hideTooltip();
    } else if (hovered && zoom < 1.5) {
      setTooltip(e, `${hovered.depID} ${hovered.depName} (${hovered.region})`);
    }

    if (dragging) {
      offsetX += e.movementX / zoom;
      offsetY += e.movementY / zoom;
      updateTransform();
    }
  });

  svgEl.style.overflow = "hidden";
  svgEl.style.cursor = "pointer";

  groups.forEach((group) => {
    const path = group.querySelector("path")!;
    const groupID = Number(group.id);
    const departmentName = getDepartmentName(groupID);
    const regionName = getRegionByDepartment(groupID)!;
    const regionColor = getRegionColor(regionName as RegionName);

    const textEl = svgObject.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    const pathRect = path.getBBox();
    console.log(pathRect, group.querySelector("path")); // il sert à qqch ce
      textEl.setAttribute("x", (pathRect.x + pathRect.width / 2).toString());
      textEl.setAttribute("y", (pathRect.y + pathRect.height / 2).toString());
      textEl.setAttribute("dominant-baseline", "middle");
      textEl.setAttribute("text-anchor", "middle");
      textEl.style.userSelect = "none";
      textEl.style.webkitUserSelect = "none";
      textEl.style.pointerEvents = "none";
      // textEl.setAttribute("fill", "black");
      textEl.innerHTML = departmentName;
      group.appendChild(textEl);
      svgDepTexts.push(textEl);
    

    path.style.transition = "fill 0.25s ease";

    group.addEventListener("mouseenter", () => {
      for (const regPath of regionsPaths[regionName])
        regPath.style.fill = regionColor;
      path.style.fill = lighten(regionColor);
      hovered = {
        region: regionName as RegionName,
        depID: groupID,
        depName: departmentName,
      };
    });

    group.addEventListener("mouseleave", () => {
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
