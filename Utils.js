/**
 * Mimics a C# type switch expression using JavaScript
 * @function switchExpression
 * @functionName Switch Expression
 * @param {string} value - The value to match against case keys.
 * @param {Object<string, Function>} cases - An object where keys are match strings (e.g., "1 or 2 or 3") and values are functions to execute.
 * @returns {*} The result of the matched case function or null if no match found and no default (_) is provided.
 * @example
 * const result = switchExpression("1", {
 *   "1 or 2": () => "Matched",
 *   "_": () => "Default"
 * });
 */
function switchExpression(value, cases) {
  for (const [key, result] of Object.entries(cases)) {
    if (key === '_') {
      return result();
    }

    const keys = key.replace(/\s*\|\|\s*/g, ' or ').split(' or ');
    if (keys.includes(String(value))) {
      return result();
    }
  }
  return null;
}

///DOM Traversal

/**
 * Returns the first element that matches a CSS query.
 * @function qs
 * @functionName Query Selector
 * @param {string} selector - The CSS selector string.
 * @param {HTMLElement} [parent=document] - Optional parent to scope the query.
 * @returns {HTMLElement|null} The first matching element or null.
 */
function qs(selector, parent) {
  return (parent || document).querySelector(selector);
}

/**
 * Returns all elements that match a CSS query as an array.
 * @function qsa
 * @functionName Query Selector All
 * @param {string} selector - The CSS selector string.
 * @param {HTMLElement} [parent=document] - Optional parent to scope the query.
 * @returns {HTMLElement[]} Array of matching elements.
 */
function qsa(selector, parent) {
  return [...(parent || document).querySelectorAll(selector)];
}

/**
 * Returns the nearest ancestor of a descendant element matching a selector.
 * @function findAncestor
 * @functionName Find Ancestor
 * @param {string} descendantQuery - Selector for the child element.
 * @param {string} ancestorQuery - Selector for the ancestor to find.
 * @returns {HTMLElement|null} The closest ancestor matching the query.
 */
function findAncestor(descendantQuery, ancestorQuery) {
  return qs(descendantQuery).closest(ancestorQuery);
}

///
/**
 * Creates a DOM element with optional properties and appends it to a parent.
 * @function createElement
 * @functionName Create Element
 * @param {string} type - Element type (e.g. 'div').
 * @param {Object} [options={}] - Attributes, className, text, dataset, etc.
 * @param {HTMLElement|string|null} [parent=null] - Parent element or selector to append to.
 * @returns {HTMLElement|undefined} The created element or undefined if appended.
 */
function createElement(type, options = {}, parent = null) {
  const element = document.createElement(type);
  Object.entries(options).forEach(([key, value]) => {
    switch (key) {
      case "class":
      case "className":
        element.className = value;
        break;
      case "dataset":
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
        break;
      case "text":
        element.textContent = value;
        break;
      case "innerHTML":
        element.innerHTML = value;
        break;
      default:
        element.setAttribute(key, value);
        break;
    }
  });
  if (!parent) return element;
  if (typeof parent === "string") {
    qs(parent).append(element);
    return;
  }
  if (typeof parent === "object") {
    parent.append(element);
    return;
  }
}

/**
 * Appends a list of children to a parent element.
 * @function appendChildren
 * @functionName Append Children
 * @param {HTMLElement} parent - The parent element.
 * @param {HTMLElement[]} [children=[]] - Array of elements to append.
 */
function appendChildren(parent, children = []) {
  children.forEach(child => {
    (parent || document).appendChild(child);
  });
}

/**
 * Inserts raw HTML into the DOM at a specified location relative to another element.
 * @function insertRawElement
 * @functionName Insert Raw Element
 * @param {string} elementString - Raw HTML to insert.
 * @param {Element} relativeElementString - Element to insert relative to.
 * @param {string} [positionString="lastChild"] - Position like "beforebegin", "afterend", etc.
 */
function insertRawElement(elementString, relativeElementString, positionString = "lastChild") {
  const validPositions = [
    "after", "afterend",
    "before", "beforebegin",
    "firstchild", "afterbegin",
    "lastchild", "beforeend",
    "first-child", "last-child"
  ];
  const positionLookup = {
    "beforebegin": "beforebegin", "before": "beforebegin",
    "afterend": "afterend", "after": "afterend",
    "firstchild": "afterbegin", "afterbegin": "afterbegin",
    "lastchild": "beforeend", "beforeend": "beforeend",
  };
  positionString = positionString.toLowerCase();
  validateArgumentValue(validPositions, positionString);
  const position = positionLookup[positionString] || "beforeend";
  relativeElementString.insertAdjacentHTML(position, elementString);
}
/**
 * Adds a delegated event listener for the specified selector and event type.
 * @function listen
 * @functionName Listen
 * @param {string} [type="click"] - Event type.
 * @param {string} selector - CSS selector for elements to listen on.
 * @param {Function} callback - Callback function when event occurs.
 * @param {Object} [options={}] - Optional event listener options.
 */
function listen(type = "click", selector, callback, options = {}) {
  window.addEventListener(
    type,
    e => {
      if (e.target.matches(selector)) callback(e);
    },
    options
  );
}

/**
 * Removes all child nodes from a given parent node.
 * @function clearParent
 * @functionName Clear Parent
 * @param {string|HTMLElement} target - CSS selector or element reference.
 */
function clearParent(target) {
  const parents = typeof target === "string" ? qsa(target) : [target];
  parents.forEach((p) => {
    while (p.firstChild != null) {
      p.removeChild(p.firstChild);
    }
  });
}

/// Debugging Helpers
/**
 * Logs a message to the console.
 * @function log
 * @functionName Log
 * @async
 * @param {*} [message="log"] - The message or value to log.
 */
function log(message = "log") {
  console.log(message);
}

///Validation Utilities
/**
 * Validates if a value exists in an allowed array of values.
 * @function validateArgumentValue
 * @functionName Validate Argument Value
 * @param {Array} validArray - Allowed values.
 * @param {*} itemToCheck - The value to validate.
 * @param {string} [argumentName=""] - Name for the argument, used in the error message.
 * @returns {boolean} True if valid, otherwise throws an error.
 * @throws {Error} If the value is not valid.
 */
function validateArgumentValue(validArray, itemToCheck, argumentName = "") {
  if (!validArray.includes(itemToCheck))
    throw new Error(`The supplied ${argumentName} argument is invalid.`);
  return true;
}

/**
 * Validates if a value matches the specified type.
 * @function validateArgumentType
 * @functionName Validate Argument Type
 * @param {string} validType - The expected type.
 * @param {*} itemToCheck - The value to validate.
 * @param {string} argumentName - Name for the argument, used in the error message.
 * @returns {boolean} True if the type is valid, otherwise throws an error.
 * @throws {Error} If the value's type does not match.
 */
function validateArgumentType(validType, itemToCheck, argumentName) {
  if (typeof itemToCheck !== validType)
    throw new Error(`The supplied ${argumentName} argument must be a ${validType}.`);
  return true;
}

/// Pure Functions
/**
 * Returns the sum of all numeric arguments.
 * @function getSum
 * @functionName Get Sum
 * @param {...number} args - A list of numbers to sum.
 * @returns {number} The total sum.
 */
function getSum(...args) {
  return args.reduce((a, b) => a + b, 0);
}

/**
 * Returns the percentage that `part` is of the `whole`.
 * @function getPercentage
 * @functionName Get Percentage
 * @param {number} part - The numerator.
 * @param {...number} whole - One or more values that make up the denominator.
 * @returns {number} Percentage value (0–100).
 */
function getPercentage(part, ...whole) {
  return (part / whole.reduce((a, b) => a + b, 0)) * 100;
}

///Number Formatters

/**
 * Formats a number into local currency.
 * @function formatCurrency
 * @functionName Format Currency
 * @param {number} number - Amount to format.
 * @param {string} [location] - Optional BCP 47 locale string (e.g. 'en-US').
 * @returns {string} The formatted currency string.
 */
function formatCurrency(number, location) {
  const CURRENCY_FORMATTER = new Intl.NumberFormat(location || undefined, {
    currency: "USD",
    style: "currency",
  });
  return CURRENCY_FORMATTER.format(number);
}

/**
 * Formats a number using locale-aware formatting.
 * @function formatNumber
 * @functionName Format Number
 * @param {number} number - Number to format.
 * @param {string} [location] - Optional locale string.
 * @returns {string} The formatted number.
 */
function formatNumber(number, location) {
  const NUMBER_FORMATTER = new Intl.NumberFormat(location || undefined);
  return NUMBER_FORMATTER.format(number);
}

/**
 * Formats a number using compact notation (e.g., 1.2K, 3M).
 * @function formatCompactNumber
 * @functionName Format Compact Number
 * @param {number} number - Number to format.
 * @param {string} [location] - Optional locale.
 * @returns {string} Compact-formatted number.
 */
function formatCompactNumber(number, location) {
  const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(location || undefined, {
    notation: "compact",
  });
  return COMPACT_NUMBER_FORMATTER.format(number);
}

/**
 * Formats the difference between two dates using relative time.
 * @function formatRelativeDate
 * @functionName Format Relative Date
 * @param {Date|string|number} toDate - Target date.
 * @param {Date|string|number} [fromDate=new Date()] - Reference date.
 * @param {boolean} [abbreviate=false] - Use short notation (e.g., "1d" instead of "1 day").
 * @param {string} [location] - Optional locale.
 * @returns {string} Human-readable relative time.
 */
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
  ];
  const RELATIVE_DATE_FORMATTER = new Intl.RelativeTimeFormat(location || undefined, {
    numeric: "auto",
  });

  const to = typeof toDate === "string" ? Number(toDate) : toDate;
  const from = typeof fromDate === "string" ? Number(fromDate) : fromDate;

  if (isNaN(to) || isNaN(from)) return "Invalid date";

  let duration = (to - from) / 1000;
  let divs = abbreviate ? ABBREVIATED_DIVISIONS : DIVISIONS;
  for (const division of divs) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_DATE_FORMATTER.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return "some time ago";
}

///Text Formatters

/**
 * Converts a string to Proper Case (Each Word Capitalized).
 * @function toProperCase
 * @functionName To Proper Case
 * @param {string} string - Input text.
 * @returns {string} Proper cased string.
 */
function toProperCase(string) {
  if (!string) return "";
  return string.split(" ")
    .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Converts a string to Title Case, respecting small words like "of", "and", etc.
 * @function toTitleCase
 * @functionName To Title Case
 * @param {string} string - Input text.
 * @returns {string} Title-cased string.
 */
function toTitleCase(string) {
  if (!string) return "";
  return string.split(" ").map((str, index) => {
    const smallWords = ["a", "an", "the", "and", "as", "but", "for", "if", "nor", "or", "so", "yet", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via"];
    return (
      index > 0 && (smallWords.includes(str.toLowerCase()) || str.length < 3)
        ? str.toLowerCase()
        : (str.includes("-")
          ? str.split("-").map(toProperCase).join("-")
          : toProperCase(str))
    );
  }).join(" ");
}

/**
 * Formats a list into a human-readable string.
 * @function formatList
 * @functionName Format List
 * @param {string[]} array - The items in the list.
 * @param {string|boolean} [commas="long"] - Controls punctuation style: "long", "short", "narrow", or false.
 * @param {string} [andOr="unit"] - Type of conjunction: "and", "or", "unit".
 * @param {string} [location] - Optional locale string.
 * @returns {string} A formatted list.
 */
function formatList(array, commas, andOr, location) {
  const typeLookup = {
    "and": "conjunction",
    "conjunction": "conjunction",
    "or": "disjunction",
    "disjunction": "disjunction",
    "unit": "unit"
  };
  const LIST_FORMATTER = new Intl.ListFormat(location || undefined, {
    style: commas || "long",
    type: typeLookup[andOr] || "unit"
  });
  return LIST_FORMATTER.format(array);
}

///Performance
/**
 * Debounces a function: delays execution until after `delay` ms of inactivity.
 * @function debounce
 * @functionName Debounce
 * @param {Function} cb - Callback function to debounce.
 * @param {number} [delay=1000] - Delay in milliseconds.
 * @returns {Function} Debounced function.
 */
function debounce(cb, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay || 1000);
  };
}

/**
 * Throttles a function: ensures it's only called once every `delay` ms.
 * @function throttle
 * @functionName Throttle
 * @param {Function} cb - Callback function to throttle.
 * @param {number} [delay=1000] - Delay in milliseconds.
 * @returns {Function} Throttled function.
 */
function throttle(cb, delay) {
  let shouldWait = false;
  let waitingArgs;

  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay || 1000);
    }
  };

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    cb(...args);
    shouldWait = true;
    setTimeout(timeoutFunc, delay);
  };
}

/// Input Sanitization and Security

/**
 * Sanitizes text input by converting to textContent and extracting safe HTML.
 * @function sanitizeInput
 * @functionName Sanitize Input
 * @param {string} inputValue - Unsafe text input.
 * @returns {string} Sanitized string.
 */
function sanitizeInput(inputValue) {
  return createElement("div", { text: inputValue }).innerHTML;
}

/**
 * Escapes special HTML characters to prevent injection.
 * @function escapeHTML
 * @functionName Escape Html
 * @param {string} str - Unsafe string.
 * @returns {string} Escaped string.
 */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]
  );
}

/**
 * Checks if a string is a syntactically valid expression.
 * @function isValidExpression
 * @functionName Is Valid Expression
 * @param {string} expr - The expression string.
 * @returns {boolean} Whether it's valid.
 */
function isValidExpression(expr) {
  const callRegex = /^\s*(?:[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*(?:\(([^()]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^()])*?\))?|\(\s*\)\s*=>\s*[\s\S]+|\(\s*[a-zA-Z_$][\w$]*(?:\s*,\s*[a-zA-Z_$][\w$]*)*\s*\)\s*=>\s*[\s\S]+)\s*$/;
  if (callRegex.test(expr)) return true;
  if (expr.includes('(') && expr.includes(')')) {
    console.error("Parsing error: Complex function call may not be fully supported: ", expr);
  }
  return false;
}

/**
 * Safely attempts to access or call a value or function, with a fallback.
 * @function safeGet
 * @functionName Safe Get
 * @param {*} valueOrFn - The value or function to resolve.
 * @param {*} [fb=""] - Fallback value if access fails or is invalid.
 * @returns {*} Resolved or fallback value.
 */
function safeGet(valueOrFn, fb = "") {
  const fallback = fb || "";
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

/// Array Utilities 
/**
 * Returns the first element(s) of an array.
 * @function first
 * @functionName First
 * @param {Array} array - The array to query.
 * @param {number} [n=1] - How many elements to return.
 * @returns {*} The first element or array of elements.
 */
function first(array, n = 1) {
  if (n === 1) return array[0];
  return array.filter((_, index) => index < n);
}

/**
 * Returns the last element(s) of an array.
 * @function last
 * @functionName Last
 * @param {Array} array - The array to query.
 * @param {number} [n=1] - How many elements to return.
 * @returns {*} The last element or array of elements.
 */
function last(array, n = 1) {
  if (n === 1) return array[array.length - 1];
  return array.filter((_, index) => array.length - index <= n);
}

/**
 * Returns a random element from an array.
 * @function sample
 * @functionName Sample
 * @param {Array} array - The array to sample from.
 * @returns {*} A random element.
 */
function sample(array) {
  return array[randomNumberBetween(0, array.length - 1)];
}

/**
 * Extracts the value of a specific key from each object in an array.
 * @function pluck
 * @functionName Pluck
 * @param {Object[]} array - Array of objects.
 * @param {string} key - Key to pluck.
 * @returns {Array} Array of values.
 */
function pluck(array, key) {
  return array.map(element => element[key]);
}

/**
 * Groups an array of objects by a key.
 * @function groupBy
 * @functionName Group By
 * @param {Object[]} array - Array of objects.
 * @param {string} key - Key to group by.
 * @returns {Object} Object of grouped arrays.
 */
function groupBy(array, key) {
  return array.reduce((group, element) => {
    const keyValue = element[key];
    return { ...group, [keyValue]: [...(group[keyValue] ?? []), element] };
  }, {});
}

/**
 * Removes duplicate values from an array.
 * @function removeDuplicates
 * @functionName Remove Duplicates
 * @param {Array} array - The array to deduplicate.
 * @returns {Array} New array without duplicates.
 */
function removeDuplicates(array) {
  return Array.from(new Set(array));
}

/// General Utilities

/**
 * Returns a random integer between min and max (inclusive).
 * @function randomNumberBetween
 * @functionName Random Number Between
 * @param {number} [min=0] - Minimum number.
 * @param {number} [max=100] - Maximum number.
 * @returns {number} Random integer.
 */
function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * ((max || 100) - (min || 0) + 1) + (min || 0));
}

/**
 * Delays code execution by the given duration (in milliseconds).
 * @function sleep
 * @functionName Sleep
 * @param {number} duration - Time to wait in ms.
 * @returns {Promise<void>} Promise that resolves after delay.
 */
function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

/**
 * Memoizes the result of a function for repeated inputs.
 * @function memoize
 * @functionName Memoize
 * @param {Function} cb - Function to memoize.
 * @returns {Function} Memoized function.
 */
function memoize(cb) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = cb(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Resolves a logical callback immediately.
 * @function getLogicalValue
 * @functionName Get Logical Value
 * @param {Function} callback - Function to execute.
 * @returns {*} Return value of the function.
 */
function getLogicalValue(callback) {
  return ((...args) => {
    return callback();
  })();
}


///Device Detection

/**
 * Detects if the current device is running iOS.
 * @function isIOS
 * @functionName Is Ios
 * @returns {boolean} Whether the device is an iOS device.
 */
function isIOS() {
  return (
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
    !window.MSStream
  );
}
