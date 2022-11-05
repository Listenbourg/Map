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

import "./assets/main.css";
import map from "./assets/map_monochrome.svg";

const app = document.getElementById("app") as HTMLDivElement;
app.innerHTML = /* html */ `
  <header class="header"><div class="InnerHeader">
    <div class="header-buttons">
      <a href="https://github.com/Listenbourg/Map" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"></path></svg>
      </a>
    </div>
    </div>
  </header>
  <div class="svg-wrapper">
    <div class="region-name"></div>
    <object data="${map}" type="image/svg+xml"></object>
  </div>
  <div class="credits">NonozgYtb</div>
`;

window.addEventListener("load", () => {
    const svgObject = document.querySelector("object")!.contentDocument!;
    const svgEl = svgObject.querySelector("svg")!;
    const { setTooltip, hideTooltip } = Tooltip(
        document.querySelector("object")!,
        app.querySelector(".region-name")!
    );
    const groups = svgObject.querySelectorAll("g");
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

    const minZoom = 0.85;

    let hovered: Hovered = null;
    let zoom = minZoom;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    let mainColor = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "#252429"
        : "#D6D6D6";

    function updateTransform() {
        svgEl.style.transform = `translate(${offsetX * zoom}px, ${
            offsetY * zoom
        }px) scale(${zoom ** 4})`;
    }

    updateTransform();

    const BREAKPOINT_ZOOM = 1.2;

    svgObject.addEventListener(
        "wheel",
        (e: WheelEvent) => {
            const oldZoom = zoom;
            zoom = Math.max(minZoom, zoom - e.deltaY * 0.0005);
            updateTransform();
            svgEl.style.cursor = zoom === minZoom ? "pointer" : "grab";

            if (zoom > BREAKPOINT_ZOOM && oldZoom <= BREAKPOINT_ZOOM) {
                svgEl.style.setProperty("--text-display", "block");
                hideTooltip();
            } else if (zoom <= BREAKPOINT_ZOOM && oldZoom > BREAKPOINT_ZOOM) {
                svgEl.style.setProperty("--text-display", "none");
            }

            svgEl.style.setProperty(
                "--text-fz",
                `${Math.min(1, (1 / zoom) * 2)}rem`
            );

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
        } else if (hovered && zoom < BREAKPOINT_ZOOM) {
            setTooltip(
                e,
                `${hovered.depID} ${hovered.depName} (${hovered.region})`
            );
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
            for (const path of regionsPaths[regionName])
                path.style.fill = mainColor;
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
