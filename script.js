 const CATALOGUE = {
  "Resistors": [
    "Resistor 10 ohm", "Resistor 100 ohm", "Resistor 220 ohm",
    "Resistor 330 ohm", "Resistor 470 ohm", "Resistor 1k ohm",
    "Resistor 2.2k ohm", "Resistor 4.7k ohm", "Resistor 10k ohm",
    "Resistor 100k ohm", "Resistor 1M ohm", "Potentiometer 10k",
    "Potentiometer 100k", "LDR (Light Dependent Resistor)",
    "NTC Thermistor", "PTC Thermistor"
  ],
  "Capacitors": [
    "Ceramic Capacitor 10pF", "Ceramic Capacitor 100pF",
    "Ceramic Capacitor 1nF", "Ceramic Capacitor 10nF",
    "Ceramic Capacitor 100nF", "Electrolytic Capacitor 1uF",
    "Electrolytic Capacitor 10uF", "Electrolytic Capacitor 47uF",
    "Electrolytic Capacitor 100uF", "Electrolytic Capacitor 470uF",
    "Electrolytic Capacitor 1000uF", "Variable Capacitor"
  ],
  "Diodes and LEDs": [
    "Diode 1N4148", "Rectifier Diode 1N4001",
    "Rectifier Diode 1N4007", "Zener Diode 3.3V",
    "Zener Diode 5.1V", "LED Red", "LED Green", "LED Blue",
    "LED Yellow", "LED White", "RGB LED", "Infrared LED",
    "Photodiode", "Schottky Diode"
  ],
  "Transistors": [
    "BC547 NPN Transistor", "BC548 NPN Transistor",
    "BC557 PNP Transistor", "2N2222 NPN Transistor",
    "2N3906 PNP Transistor", "TIP122 Darlington Transistor",
    "IRFZ44N MOSFET", "IRF540N MOSFET"
  ],
  "Integrated Circuits": [
    "NE555 Timer IC", "LM358 Op-Amp IC", "LM741 Op-Amp IC",
    "LM7805 Voltage Regulator", "LM7812 Voltage Regulator",
    "LM317 Adjustable Regulator", "CD4017 Decade Counter",
    "74HC595 Shift Register", "7400 NAND Gate IC",
    "7404 NOT Gate IC", "7486 XOR Gate IC", "ULN2003 Driver IC",
    "L293D Motor Driver IC", "L298N Motor Driver Module",
    "ATmega328P Microcontroller"
  ],
  "Sensors and Transducers": [
    "DHT11 Temperature Humidity Sensor",
    "DHT22 Temperature Humidity Sensor",
    "LM35 Temperature Sensor", "DS18B20 Temperature Sensor",
    "MQ-2 Gas Sensor", "MQ-3 Alcohol Sensor",
    "HC-SR04 Ultrasonic Sensor", "PIR Motion Sensor",
    "IR Obstacle Sensor", "Sound Sensor Module",
    "Soil Moisture Sensor", "Flame Sensor Module",
    "BMP280 Pressure Sensor", "Hall Effect Sensor", "Load Cell"
  ],
  "Displays and Indicators": [
    "16x2 LCD Display", "20x4 LCD Display",
    "OLED 0.96 inch Display",
    "Seven Segment Display Common Anode",
    "Seven Segment Display Common Cathode",
    "Dot Matrix Display", "Buzzer 5V", "Active Buzzer",
    "Passive Buzzer"
  ],
  "Switches and Relays": [
    "Push Button Switch", "Toggle Switch", "Slide Switch",
    "Limit Switch", "Reed Switch", "SPDT Relay 5V",
    "SPDT Relay 12V", "Relay Module 1 Channel",
    "Relay Module 4 Channel"
  ],
  "Prototyping Accessories": [
    "Breadboard 400 Point", "Breadboard 830 Point",
    "Male-to-Male Jumper Wires", "Male-to-Female Jumper Wires",
    "Female-to-Female Jumper Wires", "IC Base 8 Pin",
    "IC Base 14 Pin", "IC Base 16 Pin",
    "Screw Terminal Block", "PCB General Purpose"
  ],
  "Power Components": [
    "9V Battery", "AA Battery", "Battery Holder 2 Cell",
    "Battery Holder 9V", "USB 5V Power Module", "5V DC Adapter",
    "12V DC Adapter", "18650 Li-ion Cell", "TP4056 Charging Module",
    "DC-DC Buck Converter LM2596", "Bridge Rectifier", "Fuse 1A"
  ],
  "Development Boards": [
    "Arduino Uno", "Arduino Nano", "ESP8266 NodeMCU",
    "ESP32 Development Board", "Raspberry Pi Pico",
    "USB-to-TTL Converter", "AVR Programmer"
  ],
  "Laboratory Instruments": [
    "Digital Multimeter", "Oscilloscope Probe",
    "Function Generator Lead", "Logic Probe"
  ],
  "Motors and Actuators": [
    "DC Motor 3-6V", "Servo Motor SG90",
    "Stepper Motor 28BYJ-48", "Stepper Driver ULN2003 Board",
    "Mini Water Pump", "Solenoid"
  ],
  "Other": ["Custom / Other Component"]
};

const INV_KEY = "ece_inventory_visible_v1";
const TX_KEY = "ece_transactions_visible_v1";

let inventory = readArray(INV_KEY);
let transactions = readArray(TX_KEY);
let editingId = null;

const $ = id => document.getElementById(id);

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function createId() {
  return Date.now() + "-" + Math.random().toString(16).slice(2);
}

function save() {
  try {
    localStorage.setItem(INV_KEY, JSON.stringify(inventory));
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
    return true;
  } catch {
    alert("Could not save data. Please check browser storage.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function seedCatalogue() {
  const oldRecords = inventory.slice();
  inventory = [];

  for (const [category, names] of Object.entries(CATALOGUE)) {
    for (const name of names) {
      const old = oldRecords.find(
        item => item.name === name && item.category === category
      );

      inventory.push(
        old
          ? { ...old, counted: old.counted ?? true }
          : {
              id: createId(),
              name,
              category,
              total: 0,
              issued: 0,
              counted: false
            }
      );
    }
  }

  // Import stock saved by earlier versions, when available.
  for (const key of ["ece_inventory_v3", "ece_inventory_v2"]) {
    try {
      const old = JSON.parse(localStorage.getItem(key));
      if (!Array.isArray(old)) continue;

      for (const record of old) {
        const category = record.category || "Other";
        const existing = inventory.find(
          item => item.name === record.name &&
                  item.category === category
        );

        if (existing) {
          existing.total = Number(
            record.total ?? record.quantity ?? existing.total
          ) || 0;

          existing.issued = Number(
            record.issued ?? existing.issued
          ) || 0;

          existing.counted = true;
        } else if (record.name) {
          inventory.push({
            id: record.id || createId(),
            name: record.name,
            category,
            total: Number(
              record.total ?? record.quantity ?? 0
            ) || 0,
            issued: Number(record.issued || 0) || 0,
            counted: true
          });
        }
      }
    } catch {
      // Ignore invalid older storage.
    }
  }

  save();
}

function remaining(item) {
  return Math.max(
    0,
    Number(item.total || 0) - Number(item.issued || 0)
  );
}

function lowStockLimit() {
  return Math.max(0, Number($("lowStockLimit").value) || 0);
}

function getStatus(item) {
  if (!item.counted) return ["Not counted yet", "uncounted"];
  if (remaining(item) <= 0) return ["Zero stock", "zero"];
  if (remaining(item) <= lowStockLimit()) return ["Low stock", "low"];
  return ["In stock", "good"];
}

function fillSelects() {
  const categories = Object.keys(CATALOGUE);

  $("addCategory").innerHTML =
    '<option value="">Select category</option>' +
    categories.map(c =>
      `<option>${escapeHTML(c)}</option>`
    ).join("");

  $("filterCategory").innerHTML =
    '<option value="all">All categories</option>' +
    categories.map(c =>
      `<option>${escapeHTML(c)}</option>`
    ).join("");

  const options = inventory
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(item =>
      `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)} — ${escapeHTML(item.category)}</option>`
    ).join("");

  $("transactionComponent").innerHTML =
    '<option value="">Select component</option>' + options;

  $("verificationComponent").innerHTML =
    '<option value="">Select component</option>' + options;
}

function fillComponentNames() {
  const category = $("addCategory").value;
  const names = CATALOGUE[category] || [];

  $("addComponent").disabled = !category;

  $("addComponent").innerHTML = category
    ? '<option value="">Select component</option>' +
      names.map(name =>
        `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`
      ).join("")
    : '<option value="">Select category first</option>';
}

function renderStats() {
  $("componentTypes").textContent = inventory.length;

  $("totalUnits").textContent = inventory.reduce(
    (sum, item) => sum + Number(item.total || 0), 0
  );

  $("issuedUnits").textContent = inventory.reduce(
    (sum, item) => sum + Number(item.issued || 0), 0
  );

  $("availableUnits").textContent = inventory.reduce(
    (sum, item) => sum + remaining(item), 0
  );
}

function renderTable() {
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("filterCategory").value;
  const filter = $("filterStatus").value;

  const rows = inventory.filter(item => {
    if (
      query &&
      !(item.name + " " + item.category).toLowerCase().includes(query)
    ) return false;

    if (category !== "all" && item.category !== category) return false;

    if (filter === "uncounted" && item.counted) return false;

    if (
      filter === "zero" &&
      (!item.counted || remaining(item) !== 0)
    ) return false;

    if (filter === "low" && getStatus(item)[1] !== "low") return false;

    if (
      filter === "available" &&
      remaining(item) <= lowStockLimit()
    ) return false;

    return true;
  }).sort((a, b) =>
    a.category.localeCompare(b.category) ||
    a.name.localeCompare(b.name)
  );

  $("inventoryTableBody").innerHTML = rows.map((item, index) => {
    const [label, className] = getStatus(item);

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.category)}</td>
        <td>${Number(item.total) || 0}</td>
        <td>${Number(item.issued) || 0}</td>
        <td>${remaining(item)}</td>
        <td>
          <span class="status ${className}">${label}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button type="button" class="edit"
              data-edit="${escapeHTML(item.id)}">Edit stock</button>
            <button type="button" class="delete"
              data-delete="${escapeHTML(item.id)}">Remove</button>
          </div>
        </td>
      </tr>`;
  }).join("") ||
    '<tr><td colspan="8">No components match your search or filters.</td></tr>';

  $("tableCount").textContent =
    `Showing ${rows.length} of ${inventory.length} catalogue components. Enter your actual stock quantities to update the table.`;

  renderStats();
}

function renderHistory() {
  $("transactionTableBody").innerHTML = transactions.length
    ? transactions.map(transaction => `
        <tr>
          <td>${escapeHTML(transaction.date)}</td>
          <td>${escapeHTML(transaction.componentName)}</td>
          <td>${transaction.type === "issue" ? "Issue" : "Return"}</td>
          <td>${transaction.quantity}</td>
          <td>${escapeHTML(transaction.student)}</td>
        </tr>`).join("")
    : '<tr><td colspan="5">No transactions recorded yet.</td></tr>';
}

function renderAll() {
  fillSelects();
  renderTable();
  renderHistory();
}

// Add a component or update its actual stock.
$("addCategory").addEventListener("change", fillComponentNames);

$("addForm").addEventListener("submit", event => {
  event.preventDefault();

  const category = $("addCategory").value;
  const name = $("addComponent").value;
  const quantity = Number($("addQuantity").value);

  if (
    !category || !name ||
    !Number.isInteger(quantity) || quantity < 0
  ) return;

  const item = inventory.find(
    x => x.category === category && x.name === name
  );

  if (item) {
    item.total = quantity;
    item.counted = true;
  } else {
    inventory.push({
      id: createId(),
      name,
      category,
      total: quantity,
      issued: 0,
      counted: true
    });
  }

  if (!save()) return;

  $("addMessage").textContent =
    `${name} stock saved as ${quantity}.`;

  $("addForm").reset();
  fillComponentNames();
  renderAll();
});

// Search, category filter and stock filters.
$("searchInput").addEventListener("input", renderTable);
$("filterCategory").addEventListener("change", renderTable);
$("filterStatus").addEventListener("change", renderTable);
$("lowStockLimit").addEventListener("input", renderTable);

// Edit or remove inventory rows.
$("inventoryTableBody").addEventListener("click", event => {
  const edit = event.target.dataset.edit;
  const remove = event.target.dataset.delete;

  if (edit) {
    const item = inventory.find(x => x.id === edit);
    if (!item) return;

    editingId = edit;
    $("editComponentName").textContent =
      `${item.name} — ${item.category}`;

    $("editTotalStock").value = item.total;
    $("editDialog").showModal();
  }

  if (remove) {
    const item = inventory.find(x => x.id === remove);
    if (!item) return;

    if (!confirm(`Remove ${item.name} from the table?`)) return;

    inventory = inventory.filter(x => x.id !== remove);
    save();
    renderAll();
  }
});

$("cancelEdit").addEventListener("click", () => {
  $("editDialog").close();
});

$("editForm").addEventListener("submit", event => {
  event.preventDefault();

  const item = inventory.find(x => x.id === editingId);
  const quantity = Number($("editTotalStock").value);

  if (
    !item ||
    !Number.isInteger(quantity) ||
    quantity < Number(item.issued || 0)
  ) {
    alert("Enter a whole number that is not less than the number already issued.");
    return;
  }

  item.total = quantity;
  item.counted = true;

  save();
  $("editDialog").close();
  renderAll();
});

// Issue components to a student or record a return.
$("transactionForm").addEventListener("submit", event => {
  event.preventDefault();

  const item = inventory.find(
    x => x.id === $("transactionComponent").value
  );

  const type = $("transactionType").value;
  const quantity = Number($("transactionQuantity").value);
  const student = $("studentName").value.trim();

  if (
    !item || !Number.isInteger(quantity) ||
    quantity < 1 || !student
  ) return;

  if (type === "issue") {
    if (quantity > remaining(item)) {
      $("transactionMessage").textContent =
        `Only ${remaining(item)} units are available.`;
      return;
    }

    item.issued = Number(item.issued || 0) + quantity;
  } else {
    if (quantity > Number(item.issued || 0)) {
      $("transactionMessage").textContent =
        `Only ${Number(item.issued || 0)} units are recorded as issued for this component.`;
      return;
    }

    item.issued -= quantity;
  }

  item.counted = true;

  transactions.unshift({
    date: new Date().toLocaleString(),
    componentName: item.name,
    type,
    quantity,
    student
  });

  if (!save()) return;

  $("transactionForm").reset();

  $("transactionMessage").textContent =
    "Transaction recorded successfully.";

  renderAll();
});

// Compare the website stock with the physical count.
$("verificationForm").addEventListener("submit", event => {
  event.preventDefault();

  const item = inventory.find(
    x => x.id === $("verificationComponent").value
  );

  const quantity = Number($("physicalQuantity").value);

  if (!item || !Number.isInteger(quantity) || quantity < 0) return;

  const difference = quantity - remaining(item);

  $("verificationMessage").textContent = difference === 0
    ? `Match: both show ${quantity} available units.`
    : `Difference: physical count is ${quantity}, website shows ${remaining(item)}. Difference: ${difference > 0 ? "+" : ""}${difference}. Use Edit stock if the physical count is correct.`;
});

// Clear history without changing inventory quantities.
$("clearHistoryButton").addEventListener("click", () => {
  if (!transactions.length) return;

  if (confirm("Clear transaction history? Stock quantities will not change.")) {
    transactions = [];
    save();
    renderHistory();
  }
});

// Initialize the complete catalogue and display the table.
seedCatalogue();
renderAll();

// ==========================================
// LOGOUT BUTTON FUNCTION
// ==========================================

function setupLogoutButton() {
  const logoutButton = $("logoutButton");

  if (!logoutButton) {
    console.error(
      'Logout button not found. Check that inventory.html contains id="logoutButton".'
    );
    return;
  }

  // Prevent the same handler from being attached twice.
  if (logoutButton.dataset.logoutReady === "true") {
    return;
  }

  logoutButton.dataset.logoutReady = "true";

  logoutButton.addEventListener("click", function (event) {
    event.preventDefault();

    const confirmLogout = confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      sessionStorage.removeItem("ece_college_id");
      sessionStorage.removeItem("ece_college_name");

      window.location.replace("login.html");
    }
  });
}

// Register Logout whether the page is loading or already loaded.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLogoutButton);
} else {
  setupLogoutButton();
}