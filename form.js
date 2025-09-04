window.onload = function () {
    const siteName = document.body.getAttribute("data-sitename");
    const featureName = document.body.getAttribute("data-formname");
    const appDomain = "https://test.formsapi.ots.la.gov";
    const form = document.getElementById("form");

    const pristine = new Pristine(form, {
        classTo: 'form-group',
        errorClass: 'has-danger',
        successClass: 'has-success',
        errorTextParent: 'form-group',
        errorTextTag: 'small',
        errorTextClass: 'text-help rounded bg-danger text-white'
    });

    const showErrorBanner = () => {
        const wrapper = qs(".validation-banner-wrapper");
        const alert = document.createElement("div");
        alert.className = "alert alert-danger fade show problem-alert col-12";
        alert.setAttribute("role", "alert");

        const icon = document.createElement("span");
        icon.className = "alert-icon fas fa-exclamation-triangle";
        icon.setAttribute("aria-hidden", true);

        const text = document.createTextNode("There are problems with your entries. Please correct them and try again");

        alert.appendChild(icon);
        alert.appendChild(text);
        wrapper.appendChild(alert);
    };

    const formValidation = (triggerButton, onSuccess, onFailure) => {
        triggerButton.addEventListener("click", e => {
            e.preventDefault();
            const existingAlert = qs(".problem-alert");
            if (existingAlert) existingAlert.remove();

            pristine.validate() ? onSuccess() : onFailure();
        });
    };

    const tryParse = str => {
        try {
            return JSON.parse(str).constructor;
        } catch {
            return false;
        }
    };

    const getValuesObject = () => {
        let values = JSON.parse(localStorage.getItem(siteName)) || {};
        values[featureName] = values[featureName] || {};
        return values;
    };

    const getBlanks = () => {
        const values = getValuesObject();
        qsa("input, textarea, select", document, true).forEach(input => {
            const key = input.name;
            if (!(key in values[featureName])) {
                values[featureName][key] = "";
            }
        });
        localStorage.setItem(siteName, JSON.stringify(values));
    };

    const storeValues = () => {
        const inputs = qsa("input, textarea, select", document, true);
        const values = getValuesObject();

        inputs.forEach(input => {
            input.addEventListener("change", () => {
                const key = input.name;
                let val;

                switch (input.type) {
                    case "select":
                        val = input.options[input.selectedIndex].value;
                        break;
                    case "checkbox":
                        val = Array.from(qsa(`input[name=${key}]:checked`, document, true)).map(c => c.value.toString());
                        val = JSON.stringify(val);
                        break;
                    case "radio":
                        const selected = qs(`input[name=${key}]:checked`);
                        val = selected ? selected.value : "";
                        break;
                    default:
                        val = input.value;
                }

                values[featureName][key] = val;
                localStorage.setItem(siteName, JSON.stringify(values));
            });
        });
    };

    const fillValues = () => {
        const values = getValuesObject();

        qsa("input, textarea, select", document, true).forEach(input => {
            const key = input.name;
            const val = values[featureName][key] || "";

            switch (input.type) {
                case "select":
                    input.value = val;
                    break;
                case "checkbox":
                    if (tryParse(val)) {
                        const parsedVal = JSON.parse(val);
                        if (parsedVal.includes(input.value)) {
                            input.checked = true;
                        }
                    }
                    break;
                case "radio":
                    if (val.includes(input.value)) {
                        input.checked = true;
                    }
                    break;
                default:
                    input.value = val;
            }
        });
    };

const requestHandler = () => {
    const submitBtn = qs("#submitFormButton");
    submitBtn.addEventListener("click", async () => {
        const url = `${appDomain}/${siteName}/${featureName}`;
        const values = JSON.parse(localStorage.getItem(siteName));
        const requestBody = JSON.stringify(values[featureName]);
        const redirectUrl = submitBtn.getAttribute("href");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: requestBody
            });

            if (response.ok) {
                // 2xx response
                window.location.href = `${redirectUrl}submitted`;
            } else {
                // 4xx or 5xx response
                let attempts = parseInt(localStorage.getItem(`${siteName}Attempts`), 10) || 0;
                attempts++;
                localStorage.setItem(`${siteName}Attempts`, attempts.toString());
                window.location.href = `${redirectUrl}failure`;
            }
        } catch (error) {
            console.error("Request failed:", error);
            let attempts = parseInt(localStorage.getItem(`${siteName}Attempts`), 10) || 0;
            attempts++;
            localStorage.setItem(`${siteName}Attempts`, attempts.toString());
            window.location.href = `${redirectUrl}failure`;
        }
    });
};


    const getInputInfo = (dev = false) => {
        if (!dev) return;

        const navbar = qs("ul.navbar-nav.navbar-icon-links");
        const pageIndex = window.location.href.slice(-2, -1);
        const url = qs(".validatedButton")?.href || "";

        const schemaBtn = document.createElement("button");
        schemaBtn.className = "btn btn-info align-self-end mb-4";
        schemaBtn.textContent = "Get Schema";

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-danger align-self-end mb-4";
        removeBtn.textContent = "Remove Schema";

        if (pageIndex === "1") {
            const li = document.createElement("li");
            li.className = "nav-item d-flex";
            li.appendChild(schemaBtn);
            navbar.appendChild(li);

            schemaBtn.addEventListener("click", () => {
                sessionStorage.setItem('__ots_get_schema', true);
                window.location.href = `${url}#getSchema`;
            });
        }

        const li = document.createElement("li");
        li.className = "nav-item d-flex";
        li.appendChild(removeBtn);
        navbar.appendChild(li);

        removeBtn.addEventListener("click", removeSchema);

        if (sessionStorage.getItem("__ots_get_schema") === "true") {
            const items = JSON.parse(sessionStorage.getItem(`${featureName}info`)) || [];

            qsa("input, select, textarea", document, true).forEach(item => {
                const info = item.getAttribute("data-info");
                if (info) items.push(JSON.parse(info));
            });

            if (qs("#submitFormButton")) {
                console.clear();
                console.table(items);
            } else if (window.location.href.includes("getSchema")) {
                sessionStorage.setItem(`${featureName}info`, JSON.stringify(items));
                location.href = `${url}#getSchema`;
            }
        }

        function removeSchema() {
            qs("input, textarea, select", document, true).forEach(input => {
                input.removeAttribute("data-info");
            });
        }
    };

    // Initialization
    if (qsa("input, textarea, select")) {
        getBlanks();
        fillValues();
        storeValues();
    }

    const validatedBtn = qs(".validatedButton");
    if (validatedBtn) {
        formValidation(validatedBtn, () => {
            location.href = validatedBtn.href;
        }, showErrorBanner);
    }

    const submitBtn = qs("#submitFormButton");
    if (submitBtn) {
        formValidation(submitBtn, requestHandler, showErrorBanner);
    }

    getInputInfo(false); // set to `true` if in dev mode
};
