/**
 * Displays a dialog where the user can add an inline image using image styles (D7).
 * The reference is added to the reference section of the BUE. The IMCE dialog is integrated
 * if IMCE is enabled.
 */
markdownEditor.image_with_style = function (filepath, file_url, default_scheme, presets) {
  var t = markdownEditor.t;
  var tag = Cactus.DOM.tag;
  var createForm = markdownEditor.dialog.createForm;
  // Default values for form fields.
  var hrefValue = "";
  var referenceValue = "";
  var titleValue = "";
  var textValue = BUE.active.getSelection();
  var inlineValue = null;
  // Remove empty presets from list.
  if ("" in presets) {
    presets[""] = t("-original-");
  }
  // Creating the form for the dialog.
  var form = createForm(
    { label : t("Alt"), mandatory : true, attributes : { name : "alt", value : textValue } },
    { label : t("Title"), attributes : { name : "title", value : titleValue } },
    { label : t("Preset"), mandatory : true, tagName : "select", options : presets, attributes : { name : "preset" } },
    { label : t("Reference"), attributes : { name : "reference", value : referenceValue } },
    { label : t("URL"), mandatory : true, attributes : { name : "href", value : hrefValue } },
    { label : t("Inline"), attributes : { name : "inline", type : "checkbox", value: inlineValue } }
  );
  // Create an onsubmit handler and various buttons.
  var submitFunction = markdownEditor.image._process_styled.bind(null, form, filepath, file_url, default_scheme, "Images");
  var mDialog = markdownEditor.dialog;
  mDialog.setOnsubmit(form, submitFunction);
  mDialog.addIMCELink(form.elements.href.parentNode, form.elements.href);
  mDialog.addSubmitButton(form, submitFunction);
  mDialog.addCancelButton(form);
  // Open the dialog and display the form.
  mDialog.open(t("Insert image"), "image");
  mDialog.getContent().appendChild(form);
  mDialog.focusFirst();
};
/**
 * Handles submissions for adding styled images.
 *
 * @param form
 *   The form element of the dialog.
 * @param filepath
 *   The base path for styled image files.
 * @param default_scheme
 *   The default scheme used to store files on site (usually 'public').
 */
markdownEditor.image._process_styled = function (form, filepath, file_url, default_scheme) {
  var Reference = markdownEditor.Reference;
  var t = markdownEditor.t;
  
  var referenceType = "Images";
  var alt = form.elements.alt.value;
  var title = form.elements.title.value;
  var reference = form.elements.reference.value || alt;
  var href = form.elements.href.value;
  var inline = form.elements.inline.checked || false;
  var preset = form.elements.preset.value;
  var scheme = default_scheme || "public";
  // Validate input.
  markdownEditor.dialog.clearErrors();
  var valid = true;
  if (!alt) {
    markdownEditor.dialog.addError(t("Alt is a required field."));
    valid = false;
  }
  if (!href) {
    markdownEditor.dialog.addError(t("URL is a required field."));
    valid = false;
  }
  if (!valid) {
    return;
  }
  // Alter URL using selected style.
  if (preset) {
    if (href.indexOf(filepath) == 0) {
      href = filepath +'/styles/'+ preset +'/'+ scheme + href.substr(filepath.length);
    }
    else if ((file_url + href).indexOf(filepath) == 0) {
      href = filepath +'/styles/'+ preset +'/'+ scheme + href.substr(filepath.length - file_url.length);
    }
    preset = '';
  }
  if (inline) {
    // Insert inline link after caret position
    var replaceString = "![" + alt + "](" + href + ( title ? ' "' + title + '"' : '' ) + ")";
    markdownEditor.selection.replaceAll(replaceString);
    BUE.dialog.close();
  }
  else {
    // The text added at the caret position.
    var textString = alt ? "![" + alt + "][" + reference + "]" : "![" + reference + "]";
    // The reference to add to the reference section.
    var ref = new Reference(referenceType, reference, href + (title ? ' "' + title + '"' : ""));
    markdownEditor.references._callback(textString, ref);
  }
};
