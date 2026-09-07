// ---------- Data ----------
const ITINERARIES = [
  {
    title: "10-Day Safari to Kenya and Uganda",
    countries: ["Kenya", "Uganda"],
    days: 10,
    style: "multi",
    price: 16784,
    desc: "Big cats and open plains in Kenya, then gorilla trekking through Uganda's forests.",
    featured: true
  },
  {
    title: "9-Day Safari to Tanzania and Uganda",
    countries: ["Tanzania", "Uganda"],
    days: 9,
    style: "multi",
    price: 18675,
    desc: "The Serengeti's great herds followed by a close encounter with mountain gorillas.",
    featured: true
  },
  {
    title: "10-Day Kenya & Tanzania Reserve Circuit",
    countries: ["Kenya", "Tanzania"],
    days: 10,
    style: "multi",
    price: 17654,
    desc: "Naboisho, Serengeti and Ruaha in one immersive cross-border reserve circuit.",
    featured: false
  },
  {
    title: "13-Day Bush & Beach East Africa Tour",
    countries: ["Tanzania"],
    days: 13,
    style: "beach",
    price: 9840,
    desc: "Northern Tanzania's parks followed by a slow unwind on the Zanzibar coast.",
    featured: true
  },
  {
    title: "9-Day Ultimate Northern Tanzania Safari",
    countries: ["Tanzania"],
    days: 9,
    style: "classic",
    price: 8320,
    desc: "Tarangire, the Ngorongoro Crater and the endless Serengeti plains, back to back.",
    featured: false
  },
  {
    title: "8-Day Pure Wilderness in Southern Tanzania",
    countries: ["Tanzania"],
    days: 8,
    style: "classic",
    price: 7460,
    desc: "Nyerere and Ruaha National Parks — remote, wild, and rarely crowded.",
    featured: false
  },
  {
    title: "Kenya's 8-Day Ultimate Highlights Safari",
    countries: ["Kenya"],
    days: 8,
    style: "classic",
    price: 6980,
    desc: "The Masai Mara, Ol Pejeta and Naboisho Conservancy in one compact classic route.",
    featured: false
  },
  {
    title: "Best of Tanzania in 10 Days: Safari & Beach",
    countries: ["Tanzania"],
    days: 10,
    style: "beach",
    price: 8990,
    desc: "A balanced 10 days pairing the northern circuit with a beach escape in Zanzibar.",
    featured: false
  },
  {
    title: "7-Day Northern Tanzania Great Migration",
    countries: ["Tanzania"],
    days: 7,
    style: "classic",
    price: 5940,
    desc: "A fast-paced week timed to the great migration's river crossings.",
    featured: false
  },
  {
    title: "8-Day Family Adventure in Kenya",
    countries: ["Kenya"],
    days: 8,
    style: "family",
    price: 6210,
    desc: "Ol Pejeta and Naboisho Conservancy, paced and planned around younger children.",
    featured: false
  },
  {
    title: "12-Day Grand Tanzania Explorer",
    countries: ["Tanzania"],
    days: 12,
    style: "classic",
    price: 11430,
    desc: "A deep, unhurried loop through every headline park in northern Tanzania.",
    featured: false
  },
  {
    title: "11-Day Kenya Family Bush & Beach",
    countries: ["Kenya"],
    days: 11,
    style: "family",
    price: 9750,
    desc: "Safari days in the Mara followed by a family-friendly stretch on the coast.",
    featured: false
  }
];

const money = n => "US$" + n.toLocaleString("en-US");

const grid = document.getElementById("itinGrid");
const tpl = document.getElementById("itinCardTpl");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");

const durationBucket = days => days <= 9 ? "short" : days <= 12 ? "medium" : "long";

function render(list){
  grid.innerHTML = "";

  list.forEach(item => {
    const node = tpl.content.cloneNode(true);

    node.querySelector(".itin-card__days").textContent = item.days + " days";
    const countriesEl = node.querySelector(".itin-card__countries");
    item.countries.forEach(c => {
      const span = document.createElement("span");
      span.textContent = c;
      countriesEl.appendChild(span);
    });
    node.querySelector(".itin-card__title").textContent = item.title;
    node.querySelector(".itin-card__desc").textContent = item.desc;
    node.querySelector(".itin-card__price-value").textContent = money(item.price);

    grid.appendChild(node);
  });

  emptyState.hidden = list.length !== 0;
  resultsCount.textContent = list.length
    ? `Showing ${list.length} itinerar${list.length === 1 ? "y" : "ies"}`
    : "";
}

function currentFilters(){
  return {
    destination: document.getElementById("fDestination").value,
    duration: document.getElementById("fDuration").value,
    style: document.getElementById("fStyle").value,
    sort: document.getElementById("sortSelect").value
  };
}

function applyFilters(){
  const { destination, duration, style, sort } = currentFilters();

  let list = ITINERARIES.filter(item => {
    const matchesDestination = destination === "all" ||
      item.countries.some(c => c.toLowerCase() === destination);
    const matchesDuration = duration === "all" || durationBucket(item.days) === duration;
    const matchesStyle = style === "all" || item.style === style;
    return matchesDestination && matchesDuration && matchesStyle;
  });

  switch (sort){
    case "days-asc": list.sort((a, b) => a.days - b.days); break;
    case "days-desc": list.sort((a, b) => b.days - a.days); break;
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    default: list.sort((a, b) => (b.featured === true) - (a.featured === true));
  }

  render(list);
}

document.getElementById("finderForm").addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("itineraries").scrollIntoView({ behavior: "smooth" });
  applyFilters();
});

["fDestination", "fDuration", "fStyle"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {});
});
document.getElementById("sortSelect").addEventListener("change", applyFilters);

applyFilters();

// ---------- Mobile nav ----------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Newsletter / plan form (demo only, no backend) ----------
document.querySelectorAll(".footer__newsletter, .cta-plan__form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    form.reset();
    const note = document.createElement("p");
    note.textContent = "Thanks — we'll be in touch shortly.";
    note.style.cssText = "margin:8px 0 0;font-size:13px;color:#d9a441;font-weight:600;";
    form.appendChild(note);
    setTimeout(() => note.remove(), 4000);
  });
});
