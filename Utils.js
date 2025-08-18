//PolyFills
export function switchExpression(value, cases) {
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

//DOM Traversal
export function qs(selector, parent) {
    return (parent || document).querySelector(selector);
}
export function qsa(selector, parent) {
    return [...(parent || document).querySelectorAll(selector)];
}
export function findAncestor(descendantQuery, ancestorQuery) {
    return qs(descendantQuery).closest(ancestorQuery);
}

//Helper Helpers
export function validateArgumentValue(validArray, itemToCheck, argumentName) {
    if (!validArray.includes(itemToCheck))
        throw new Error(`The supplied ${argumentName} argument is invalid.`)
    return true;
}
export function validateArgumentType(validType, itemToCheck, argumentName) {
    if (!validType != typeof itemToCheck)
        throw new Error(`The supplied ${argumentName} argument is must be a ${validType}.`)
    return true;
}

//DOM Manipulation
export function createElement(type, options = {}, parent = null) {
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
export function insertRawElement(elementString, relativeElementString, positionString = "lastChild") {
  const validPositions = [
    "after", "afterend", 
    "before", "beforebegin",
    "firstchild", "afterbegin",
    "lastchild", "beforeend", 
    "first-child", "last-child"
  ]
  const positionLookup = {
      "beforebegin": "beforebegin",
      "before" : "beforebegin",
      "afterend": "afterend",
      "after" : "afterend",
      "firstchild": "afterbegin",
      "afterbegin": "afterbegin",
      "lastchild": "beforeend",
      "beforeend": "beforeend",
    }
  positionString = positionString.toLowerCase()
  validateArgumentValue(validPositions, positionString)

  const position = positionLookup[positionString] || "beforeend"

  qs(relativeElementString).insertAdjacentHTML(position, elementString);
}
export function listen(type, selector, callback, options = {}) {
    window.addEventListener(
        type,
        e => {
            if (e.target.matches(selector)) callback(e)
        },
        options
    )
}
export function clearParent(target) {
  const parents = typeof target === "string" ? qsa(target) : [target];
  parents.forEach((p) => {
    while (p.firstChild != null) {
      p.removeChild(p.firstChild);
    }
  });
}


//Debugging Helpers
export function log(message) {
    console.log(message)
}

//Pure export Functions for Small Computations
export function getSum(...args) {
    return args.reduce((a, b) => { return a + b }, 0);
}
export function getPercentage(part, ...whole) {
    return (part / whole.reduce((a, b) => a + b, 0)) * 100;
}

// Number Formatters
export function formatCurrency(number, location) {
    const CURRENCY_FORMATTER = new Intl.NumberFormat((location || undefined), {
        currency: "USD",
        style: "currency",
    })
    return CURRENCY_FORMATTER.format(number)
}
export function formatNumber(number, location) {
    const NUMBER_FORMATTER = new Intl.NumberFormat(location || undefined)
    return NUMBER_FORMATTER.format(number)
}
export function formatCompactNumber(number, location) {
    const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat((location || undefined), {
        notation: "compact",
    })
    return COMPACT_NUMBER_FORMATTER.format(number)
}
export function formatRelativeDate(toDate, fromDate = new Date(), abbreviate = false, location) {
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


// Text Formatters
export function toProperCase(string) {
    return string?.split(" ").map((s) => { return `${s[0].toUpperCase()}${s.slice(1).toLowerCase()}` }).join(" ")
}
export function toTitleCase(string) {
    return string?.split(" ").map((str, index) => {
        return (
            index > 0 && (["a", "an", "the", "and", "as", "but", "for", "if", "nor", "or", "so", "yet", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via"].includes(str.toLowerCase()) || str.length < 3)) ? str.toLowerCase() :
            (str.split("-").length > 1) ? str.split("-").map((s) => { return toProperCase(s) }).join("-") :
                toProperCase(str)
    }).join(" ");
}
export function formatList(array,  commas, andOr, location){
  const typeLookup = {
    "and": "conjunction",
    "conjunction": "conjunction",
    "or": "disjunction",
    "disjunction": "disjunction",
    "unit" : "unit"
  }
  const styleLookup = {
    "long": "long",
    "short": "short",
    "narrow": "narrow",
    "none" : "narrow",
    false : "narrow",
    true: "long",
    "ampersand" : "short",
    "word": "long"
  }
  const LIST_FORMATTER = new Intl.ListFormat((location || undefined), {style: (commas || "long"), type: typeLookup[andOr] || "unit"})
  return LIST_FORMATTER.format(array)
}

//Performance
export function debounce(cb, delay) {
    let timeout

    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            cb(...args)
        }, (delay || 1000))
    }
}
export function throttle(cb, delay) {
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
export function sanitizeInput(inputValue) {
    return createElement("div", { text: inputValue }).innerHTML;
}
export function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]
  );
}


export function isValidExpression(expr) {
const callRegex = /^\s*(?:[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*(?:\(([^()]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|[^()])*?\))?|\(\s*\)\s*=>\s*[\s\S]+|\(\s*[a-zA-Z_$][\w$]*(?:\s*,\s*[a-zA-Z_$][\w$]*)*\s*\)\s*=>\s*[\s\S]+)\s*$/;
  if (callRegex.test(expr)) {
    return true;
  }
  if (expr.includes('(') && expr.includes(')')) {
    console.error("Parsing error: Complex export function call may not be fully supported:", expr);
  }
  return false;
}

export function safeGet(valueOrFn, fb = "") {
  const fallback = fb || ""
  try {
    if (typeof valueOrFn === "export function") {
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
//Array Utitlities
export function first(array, n = 1) {
    if (n === 1) return array[0]
    return array.filter((_, index) => index < n)
} // Get the first N elements in the array
export function last(array, n = 1) {
    if (n === 1) return array[array.length - 1]
    return array.filter((_, index) => array.length - index <= n)
} // Get the last N elements in the array
export function sample(array) {
    return array[randomNumberBetween(0, array.length - 1)]
}
export function pluck(array, key) {
    return array.map(element => element[key])
}
export function groupBy(array, key) {
    return array.reduce((group, element) => {
        const keyValue = element[key]
        return { ...group, [keyValue]: [...(group[keyValue] ?? []), element] }
    }, {})
}
export function removeDuplicates(array) {
    return Array.from(new Set(array));
}

//Other Utilities
export function randomNumberBetween(min, max) {
    return Math.floor(Math.random() * ((max || 100) - (min || 0) + 1) + (min || 0))
}
export function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration)
    })
}
export function memoize(cb) {
    const cache = new Map()
    return (...args) => {
        const key = JSON.stringify(args)
        if (cache.has(key)) return cache.get(key)

        const result = cb(...args)
        cache.set(key, result)
        return result
    }
}

export function getLogicalValue(callback) {
    return ((...args) => {
        return callback();
    })();
}
export function isIOS() {
    return (
        (/iPad|iPhone|iPod/.test(navigator.platform) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !window.MSStream //MSStream is to avoid IE11
    );
}
