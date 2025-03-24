let appInd;
const a = window.location.pathname === "/yz";
const c = window.location.pathname === "/gt";

let t;

try {
  t = window.top.location.pathname === "/rx";
} catch {
  try {
    t = window.parent.location.pathname === "/rx";
  } catch {
    t = false;
  }
}

function Span(name) {
  return name.split("").map(char => {
    const span = document.createElement("span");
    span.textContent = char;
    return span;
  });
}

function saveToLocal(path) {
  sessionStorage.setItem("GoUrl", path);
}

function handleClick(app) {
  if (typeof app.say !== "undefined") {
    alert(app.say);
  }

  let Selected = app.link;
  if (app.links && app.links.length > 1) {
    Selected = getSelected(app.links);
    if (!Selected) {
      return false;
    }
  }

  if (app.local) {
    saveToLocal(Selected);
    window.location.href = "rx";
    if (t) {
      window.location.href = Selected;
    }
  } else if (app.local2) {
    saveToLocal(Selected);
    window.location.href = Selected;
  } else if (app.blank) {
    blank(Selected);
  } else if (app.now) {
    now(Selected);
    if (t) {
      window.location.href = Selected;
    }
  } else if (app.custom) {
    Custom(app);
  } else if (app.dy) {
    dy(Selected);
  } else {
    go(Selected);
    if (t) {
      blank(Selected);
    }
  }
  return false;
}

function getSelected(links) {
  const options = links
    .map((link, index) => `${index + 1}: ${link.name}`)
    .join("\n");
  const choice = prompt(
    `Select a link by entering the corresponding number:\n${options}`,
  );
  const selectedIndex = Number.parseInt(choice, 10) - 1;

  if (
    Number.isNaN(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= links.length
  ) {
    alert("Invalid selection. Please try again.");
    return null;
  }

  return links[selectedIndex].url;
}

function CustomApp(customApp) {
  let apps;
  if (c) {
    apps = localStorage.getItem("Tcustom");
  } else if (a) {
    apps = localStorage.getItem("Acustom");
  }

  if (apps === null) {
    apps = {};
  } else {
    apps = JSON.parse(apps);
  }

  const key = `custom${Object.keys(apps).length + 1}`;

  apps[key] = customApp;

  if (c) {
    localStorage.setItem("Tcustom", JSON.stringify(apps));
  } else if (a) {
    localStorage.setItem("Acustom", JSON.stringify(apps));
  }
}

function setPin(index) {
  let pins;
  if (c) {
    pins = localStorage.getItem("Tpinned");
  } else if (a) {
    pins = localStorage.getItem("Apinned");
  }

  if (pins === null || pins === "") {
    pins = [];
  } else {
    pins = pins.split(",").map(Number);
  }
  if (pinContains(index, pins)) {
    const remove = pins.indexOf(index);
    pins.splice(remove, 1);
  } else {
    pins.push(index);
  }
  if (c) {
    localStorage.setItem("Tpinned", pins);
  } else if (a) {
    localStorage.setItem("Apinned", pins);
  }
  location.reload();
}

function pinContains(i, p) {
  if (p === "") {
    return false;
  }
  for (const x of p) {
    if (x === i) {
      return true;
    }
  }
  return false;
}

function Custom(app) {
  const title = prompt("Enter title for the app:");
  const link = prompt("Enter link for the app:");
  if (title && link) {
    const customApp = {
      name: `${title}`,
      link: link,
      custom: false,
    };

    CustomApp(customApp);
    CreateCustomApp(customApp);
  }
}

function CreateCustomApp(customApp) {
  const columnDiv = document.createElement("div");
  columnDiv.classList.add("column");

  const pinIcon = document.createElement("i");
  pinIcon.classList.add("fa", "fa-map-pin");
  pinIcon.ariaHidden = true;

  const btn = document.createElement("button");
  btn.appendChild(pinIcon);
  btn.style.float = "right";
  btn.style.cursor = "pointer";
  btn.style.backgroundColor = "rgb(45,45,45)";
  btn.style.borderRadius = "50%";
  btn.style.borderColor = "transparent";
  btn.style.color = "white";
  btn.style.top = "-200px";
  btn.style.position = "relative";
  btn.onclick = () => {
    setPin(appInd);
  };
  btn.title = "Pin";

  const linkElem = document.createElement("a");
  linkElem.onclick = () => {
    handleClick(customApp);
  };

  const paragraph = document.createElement("p");

  for (const span of Span(customApp.name)) {
    paragraph.appendChild(span);
  }
  linkElem.appendChild(paragraph);
  columnDiv.appendChild(linkElem);
  columnDiv.appendChild(btn);

  const nonPinnedApps = document.querySelector(".apps");
  nonPinnedApps.insertBefore(columnDiv, nonPinnedApps.firstChild);
}

document.addEventListener("DOMContentLoaded", () => {
  let storedApps;
  if (c) {
    storedApps = JSON.parse(localStorage.getItem("Tcustom"));
  } else if (a) {
    storedApps = JSON.parse(localStorage.getItem("Acustom"));
  }
  if (storedApps) {
    for (const app of Object.values(storedApps)) {
      CreateCustomApp(app);
    }
  }
});

let path = "/assets/json/a.min.json";
if (c) {
  path = "/assets/json/t.min.json";
}
fetch(path)
  .then(response => {
    return response.json();
  })
  .then(appsList => {
    appsList.sort((a, b) => {
      if (a.custom) {
        return -1;
      }
      if (b.custom) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    const nonPinnedApps = document.querySelector(".apps");
    const pinnedApps = document.querySelector(".pinned");
    let pinList;
    if (a) {
      pinList = localStorage.getItem("Apinned") || "";
    } else if (c) {
      pinList = localStorage.getItem("Tpinned") || "";
    }
    pinList = pinList ? pinList.split(",").map(Number) : [];
    appInd = 0;

    for (const app of appsList) {
      const pinNum = appInd;

      const columnDiv = document.createElement("div");
      columnDiv.classList.add("column");

      const pinIcon = document.createElement("i");
      pinIcon.classList.add("fa", "fa-map-pin");
      pinIcon.ariaHidden = true;

      const btn = document.createElement("button");
      btn.appendChild(pinIcon);
      btn.style.float = "right";
      btn.style.backgroundColor = "rgb(45,45,45)";
      btn.style.borderRadius = "50%";
      btn.style.borderColor = "transparent";
      btn.style.color = "white";
      btn.style.position = "relative";
      btn.onclick = () => {
        setPin(pinNum);
      };
      btn.title = "Pin";

      const link = document.createElement("a");

      link.onclick = () => {
        handleClick(app);
      };

      const paragraph = document.createElement("p");

      for (const span of Span(app.name)) {
        paragraph.appendChild(span);
      }

      link.appendChild(paragraph);
      columnDiv.appendChild(link);

      if (appInd !== 0) {
        columnDiv.appendChild(btn);
      }

      if (pinList != null && appInd !== 0) {
        if (pinContains(appInd, pinList)) {
          pinnedApps.appendChild(columnDiv);
        } else {
          nonPinnedApps.appendChild(columnDiv);
        }
      } else {
        nonPinnedApps.appendChild(columnDiv);
      }
      appInd += 1;
    }

    const appsContainer = document.getElementById("apps-container");
    appsContainer.appendChild(pinnedApps);
    appsContainer.appendChild(nonPinnedApps);
  })
  .catch(error => {
    console.error("Error fetching JSON data:", error);
  });

function bar() {
  const input = document.getElementById("search");
  const filter = input.value.toLowerCase();
  const g = document.getElementsByClassName("column");

  for (const game of g) {
    const name = game.getElementsByTagName("p")[0].textContent.toLowerCase();

    if (name.includes(filter)) {
      game.style.display = "block";
    } else {
      game.style.display = "none";
    }
  }
}
