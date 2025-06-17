window.onload = () => {
  const $$ = (query, parent = document, forceAll = false) => {
    const elements = parent.querySelectorAll(query);
    return elements.length > 1 || forceAll ? elements : elements[0];
  };

  const body = $$("body");
  const siteName = body.getAttribute("data-sitename");
  const featureName = body.getAttribute("data-formname");
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
    const wrapper = $$(".validation-banner-wrapper");
    if (!wrapper) return;

    const alert = document.createElement("div");
    alert.className = "alert alert-danger fade show problem-alert col-12";
    alert.setAttribute("role", "alert");

    const icon = document.createElement('span');
    icon.className = "alert-icon fas fa-exclamation-triangle";
    icon.setAttribute("aria-hidden", "true");

    alert.appendChild(icon);
    alert.appendChild(document.createTextNode("There are problems with your entries. Please correct them and try again"));

    wrapper.appendChild(alert);
  };

  const formValidation = (button, onSuccess, onFailure) => {
    button.addEventListener("click", e => {
      e.preventDefault();

      const existingAlert = $$(".problem-alert");
      if (existingAlert?.remove) existingAlert.remove();

      pristine.validate() ? onSuccess() : onFailure();
    });
  };

  const tryParse = str => {
    try {
      return JSON.parse(str)?.constructor;
    } catch {
      return false;
    }
  };

  const getValuesObject = () => {
    const stored = localStorage.getItem(siteName);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[featureName] = parsed[featureName] || {};
    return parsed;
  };

  const setValuesObject = values => {
    localStorage.setItem(siteName, JSON.stringify(values));
  };

  const getBlanks = () => {
    const values = getValuesObject();
    $$("input, textarea, select", document, true).forEach(input => {
      if (!values[featureName][input.name]) {
        values[featureName][input.name] = "";
      }
    });
    setValuesObject(values);
  };

  const storeValues = () => {
    $$("input, textarea, select", document, true).forEach(input => {
      input.addEventListener("change", () => {
        const values = getValuesObject();
        const key = input.name;
        let val;

        if (input.tagName.toLowerCase() === "select") {
          val = input.value;
        } else if (input.type === "checkbox") {
          const checked = $$(`input[name="${key}"]:checked`, document, true);
          val = Array.from(checked).map(cb => cb.value);
          val = JSON.stringify(val);
        } else if (input.type === "radio") {
          const selected = $$(`input[name="${key}"]:checked`);
          val = selected ? selected.value : "";
        } else {
          val = input.value;
        }

        values[featureName][key]()
