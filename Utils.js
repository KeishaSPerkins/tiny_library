
//HEADING: Polyfills
//DOC: Switch Expression
//DESCRIPTION: Mimics a C# type switch expression using JavaScript
//PARAM: { name: "value", datatype: "string", description: "The first name of the user", required: true }
//PARAM: { name: "cases", datatype: "object array", required: true }
//functionStart
function switchExpression(value, cases) {
  for (const [key, result] of Object.entries(cases)) {
    if (key === '_') {
      // Default case
      return result();
    }

    // Replace both ' or ' and '||' with a common separator for splitting
    const keys = key.replace(/\s*\|\|\s*/g, ' or ').split(' or ');

    // Check if the value is in the current case group
    if (keys.includes(String(value))) {
      return result();
    }
  }
  return null; // If no match and no default case
  //   const StatusId = 7; // Example StatusId (could be any value)

  // // Mimicking C# switch expression logic
  //   const DisplayStatusColumnObj = switchExpression(StatusId, {
  //   '1 or 2 or 3 or 4': () => ({ label: "Status Duration", value: DisplayNewStatusDaysActive }), //condition group wrapped in string
  //   '6 || 7': () => ({ label: "Last Updated", value: PeriodStartLocal }),
  //   '_': () => ({ label: "Status", value: Status?.Status ?? "" }) // Default case
  // });

}
//functionEnd

//HEADING: DOM Traversal
//DOC: Query Selector
//DESCRIPTION: Returns one item--either the first or only--that matches a CSS query. Saves you from typing <code>document.querySelector()</code> several times in your functions.
//PARAM: { name: "selector", datatype: "string", description: "The query to be searched", required: true }
//PARAM: { name: "parent", datatype: "HTML Element", description: "The parent element to search within", required: false }
//functionStart
function qs(selector, parent) {
  return (parent || document).querySelector(selector);
}
//functionEnd

//DOC: Query Selector All
//DESCRIPTION: Returns an array of HTML elements that match a CSS query. Saves you from typing <code>document.querySelectorAll()</code> several times in your functions.
//PARAM: { name: "selector", datatype: "string", description: "The query to be searched", required: true }
//PARAM: { name: "parent", datatype: "HTML Element", description: "The parent element to search within", required: false }
//functionStart
function qsa(selector, parent) {
  return [...(parent || document).querySelectorAll(selector)];
}
//functionEnd

//DOC: Find Ancestor
//DESCRIPTION: Returns the nearest ancestor that matches a given query
//PARAM: {name: "descendantQuery", datatype: "string", description: "The query for the item to be searched", required: true}
//PARAM: {name: "descendantQuery", datatype: "string", description: "The query for the item to be searched", required: true}
//functionStart
function findAncestor(descendantQuery, ancestorQuery) {
  return qs(descendantQuery).closest(ancestorQuery);
}
//functionEnd


//HEADING: Helper Helpers

//DOC: Validate Argument Value
//DESCRIPTION: Returns whether a given argument is a valid argument for the given function
//PARAM: {name: "validArray", datatype: "array", description: "An array of values on any type that lists the arguments the function will accept.", required: true}
//PARAM: {name: "itemToCheck", datatype: "any", description: "The value that is being validated", required: true}
//PARAM: {name: "argumentName", datatype: "string", description: "A name for the argument that can be used for error logging.", required: false}
//functionStart
function validateArgumentValue(validArray, itemToCheck, argumentName = "") {
  if (!validArray.includes(itemToCheck))
    throw new Error(`The supplied ${argumentName} argument is invalid.`)
  return true;
}
//functionEnd

//functionStart
function validateArgumentType(validType, itemToCheck, argumentName) {
  if (!validType != typeof itemToCheck)
    throw new Error(`The supplied ${argumentName} argument is must be a ${validType}.`)
  return true;
}
//functionEnd


//HEADING: DOM Manipulation

//DOC: Create Element
//DESCRIPTION: Creates an element with the attributes specified and appends the element to a parent or returns a reference to the created element.
//PARAM: {name: "type", datatype: "string", description: "The name of the HTML element being created. (e.g. "div", "span", "ul"), required: true}
//PARAM: {name: "options", datatype: "object", description: "An object containing characteristics like <code>className</code>, attributes, and text content, required: false}
//PARAM: {name: "parent", datatype: "string, reference", description: "A reference to a parent element or a query string to find the parent", required: false}
//functionStart
function createElement(type, options = {}, parent = null) {
  const element = document.createElement(type);
  Object.entries(options).forEach(([key, value]) => {
    switch (key) {
      case "class":
      case "className":
        element.className = value
        break;
      case "dataset":
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue
        })
        break;
      case "text":
        element.textContent = value
        break;
      case "innerHTML":
        element.innerHTML = value
        break;
      default:
        element.setAttribute(key, value)
        break;
    }
  })
  if (!parent) { return element; }
  if (typeof parent == "string") { qs(parent).append(element); return; }
  if (typeof parent == "object") { parent.append(element); return; }
}
//functionEnd

//DOC: Append Children
//DESCRIPTION: Appends a list of children to a parent element
//PARAM: {name: "parent", datatype: "reference", "description": The parent element to be appended to, required: true}
//PARAM: {name: "children", datatype: "array", description: "An array of references to the children to be appended", required: false}
//functionStart
function appendChildren(parent, children = []) {
  children.forEach(child => {
    (parent || document).appendChild(child)
  })
}
//functionEnd

//DOC: Insert Raw Element
//DESCRIPTION: Inserts the raw HTML of an created element into the DOM, in the place specified
//PARAM: {name: "elementString", datatype: "string", description: "The raw HTML to be injected into the DOM", required: true}
//PARAM: {name: "relativeElementString", datatype: "reference", description: "Sibling or parent of the inserted HTML", required: true}
//PARAM: {name: "positionString", datatype: "string", description: "The relative position of the inserted element", default: "lastChild", required: false}
//functionStart
function insertRawElement(elementString, relativeElementString, positionString = "lastChild") {
  const validPositions = [
    "after", "afterend",
    "before", "beforebegin",
    "firstchild", "afterbegin",
    "lastchild", "beforeend",
    "first-child", "last-child"
  ]
  const positionLookup = {
    "beforebegin": "beforebegin", "before": "beforebegin",
    "afterend": "afterend", "after": "afterend",
    "firstchild": "afterbegin", "afterbegin": "afterbegin",
    "lastchild": "beforeend", "beforeend": "beforeend",
  }
  positionString = positionString.toLowerCase()
  validateArgumentValue(validPositions, positionString)

  const position = positionLookup[positionString] || "beforeend"

  relativeElementString.insertAdjacentHTML(position, elementString);
}
//functionEnd

//DOC: Listen
//DESCRIPTION: Creates a global event that allows for callback and options
//PARAM: {name: "type", datatype: "string", description: "The type of event listener to be applied", required: false, default: "click"}
//PARAM: {name: "selector", datatype: "string", description: "A querystring defining the HTML nodes to place a listener onto", required: true}
//PARAM: {name: "callback", datatype: "function", description: "The callback to be fired on the event", required: true}
//PARAM: {name: "options", datatype: "object", description: "Options to be added listener", required: false}
//functionStart
function listen(type = "click", selector, callback, options = {}) {
  window.addEventListener(
    type,
    e => {
      if (e.target.matches(selector)) callback(e)
    },
    options
  )
}
//functionEnd

//DOC: Clear Parent
//functionStart
function clearParent(target) {
  const parents = typeof target === "string" ? qsa(target) : [target];
  parents.forEach((p) => {
    while (p.firstChild != null) {
      p.removeChild(p.firstChild);
    }
  });
}
//functionEnd



//Debugging Helpers
//functionStart
function log(message) {
  console.log(message)
}
//functionEnd


//Pure Functions for Small Computations
//functionStart
function getSum(...args) {
  return args.reduce((a, b) => { return a + b }, 0);
}
//functionEnd

//functionStart
function getPercentage(part, ...whole) {
  return (part / whole.reduce((a, b) => a + b, 0)) * 100;
}
//functionEnd


// Number Formatters
//functionStart
function formatCurrency(number, location) {
  const CURRENCY_FORMATTER = new Intl.NumberFormat((location || undefined), {
    currency: "USD",
    style: "currency",
  })
  return CURRENCY_FORMATTER.format(number)
}
//functionEnd

//functionStart
function formatNumber(number, location) {
  const NUMBER_FORMATTER = new Intl.NumberFormat(location || undefined)
  return NUMBER_FORMATTER.format(number)
}
//functionEnd

//functionStart
function formatCompactNumber(number, location) {
  const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat((location || undefined), {
    notation: "compact",
  })
  return COMPACT_NUMBER_FORMATTER.format(number)
}
//functionEnd

//functionStart
function formatRelativeDate(toDate, fromDate = new Date(), abbreviate = false, location) {
  const DIVISIONS = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
  ];
  const ABBREVIATED_DIVISIONS = [
    { amount: 60, name: "s" },
    { amount: 60, name: "m" },
    { amount: 24, name: "h" },
    { amount: 7, name: "d" },
    { amount: 4.34524, name: "w" },
    { amount: 12, name: "m" },
    { amount: Number.POSITIVE_INFINITY, name: "y" }
  ]
  const RELATIVE_DATE_FORMATTER = new Intl.RelativeTimeFormat(location || undefined, {
    numeric: "auto",
  });

  // Parse input
  const to = typeof toDate === "string" ? Number(toDate) : toDate;
  const from = typeof fromDate === "string" ? Number(fromDate) : fromDate;

  // Validate
  if (isNaN(to) || isNaN(from)) return "Invalid date";

  let duration = (to - from) / 1000;
  let divs = abbreviate ? ABBREVIATED_DIVISIONS : DIVISIONS
  for (const division of divs) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_DATE_FORMATTER.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return "some time ago";
}
//functionEnd



// Text Formatters
//functionStart
function toProperCase(string) {
  if (!string) { return "" }
  return string.split(" ").map((s) => { return s[0].toUpperCase() + s.slice(1).toLowerCase() }).join(" ")
}
//functionEnd

//functionStart
function toTitleCase(string) {
  if (!string) { return "" }
  return string.split(" ").map((str, index) => {
    return (
      index > 0 && (["a", "an", "the", "and", "as", "but", "for", "if", "nor", "or", "so", "yet", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via"].includes(str.toLowerCase()) || str.length < 3)) ? str.toLowerCase() :
      (str.split("-").length > 1) ? str.split("-").map((s) => { return toProperCase(s) }).join("-") :
        toProperCase(str)
  }).join(" ");
}
//functionEnd

//functionStart
function formatList(array, commas, andOr, location) {
  const typeLookup = {
    "and": "conjunction",
    "conjunction": "conjunction",
    "or": "disjunction",
    "disjunction": "disjunction",
    "unit": "unit"
  }
  const styleLookup = {
    false: "narrow",
    true: "long",
    "long": "long",
    "short": "short",
    "narrow": "narrow",
    "none": "narrow",
    "ampersand": "short",
    "word": "long"
  }
  const LIST_FORMATTER = new Intl.ListFormat((location || undefined), { style: (commas || "long"), type: typeLookup[andOr] || "unit" })
  return LIST_FORMATTER.format(array)
}
//functionEnd


//Performance
//functionStart
function debounce(cb, delay) {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, (delay || 1000))
  }
}
//functionEnd

//functionStart
function throttle(cb, delay) {
  let shouldWait = false
  let waitingArgs
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      cb(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, (delay || 1000))
    }
  }

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    cb(...args)
    shouldWait = true

    setTimeout(timeoutFunc, delay)
  }
}
//functionEnd

//functionStart
function sanitizeInput(inputValue) {
  return createElement("div", { text: inputValue }).innerHTML;
}
//functionEnd

//functionStart
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]
  );
}
//functionEnd



//functionStart
function isValidExpression(expr) {
  const callRegex = /^\s*(?:[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*(?:\(([^()]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^()])*?\))?|\(\s*\)\s*=>\s*[\s\S]+|\(\s*[a-zA-Z_$][\w$]*(?:\s*,\s*[a-zA-Z_$][\w$]*)*\s*\)\s*=>\s*[\s\S]+)\s*$/;
  if (callRegex.test(expr)) {
    return true;
  }
  if (expr.includes('(') && expr.includes(')')) {
    console.error("Parsing error: Complex function call may not be fully supported: ", expr);
  }
  return false;

}
//functionEnd

//functionStart
function safeGet(valueOrFn, fb = "") {
  const fallback = fb || ""
  try {
    if (typeof valueOrFn === "function") {
      const result = valueOrFn();
      if (typeof result === "string" && !isValidExpression(result)) {
        return fallback;
      }
      return result != null ? result : fallback;
    } else {
      if (typeof valueOrFn === "string" && !isValidExpression(valueOrFn)) {
        return fallback;
      }
      return valueOrFn != null ? valueOrFn : fallback;
    }
  } catch (error) {
    console.error("safeGet error:", error);
    return fallback;
  }
}
//functionEnd

//Array Utilities
// Get the first N elements in the array

//functionStart
function first(array, n = 1) {
  if (n === 1) return array[0]
  return array.filter((_, index) => index < n)
}
// Get the last N elements in the array

//functionStart
function last(array, n = 1) {
  if (n === 1) return array[array.length - 1]
  return array.filter((_, index) => array.length - index <= n)
}
//functionEnd

//functionStart
function sample(array) {
  return array[randomNumberBetween(0, array.length - 1)]
}
//functionEnd

//functionStart
function pluck(array, key) {
  return array.map(element => element[key])
}
//functionEnd

//functionStart
function groupBy(array, key) {
  return array.reduce((group, element) => {
    const keyValue = element[key]
    return { ...group, [keyValue]: [...(group[keyValue] ?? []), element] }
  }, {})
}
//functionEnd

//functionStart
function removeDuplicates(array) {
  return Array.from(new Set(array));
}
//functionEnd


//Other Utilities
//functionStart
function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * ((max || 100) - (min || 0) + 1) + (min || 0))
}
//functionEnd

//functionStart
function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}
//functionEnd

//functionStart
function memoize(cb) {
  const cache = new Map()
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = cb(...args)
    cache.set(key, result)
    return result
  }
}
//functionEnd


//functionStart
function getLogicalValue(callback) {
  return ((...args) => {
    return callback();
  })();
}
//functionEnd

//functionStart
function isIOS() {
  return (
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !window.MSStream //MSStream is to avoid IE11
  );
}
//functionEnd

