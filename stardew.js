var bundleDict = {};
// Load items
$("tbody").each((tableIter, tableItem) => {
    // Multiple parts of this expression could be undefined or null, so we just try/catch it instead of having a check for every single possibility.
    var bundleName;
    try {
        bundleName = $($($(tableItem).find("tr")[0]).find("th")[0]).attr("id");
    } catch(e) { }
    if (bundleName != undefined) {
        // We found a bundle table, so we make the checkboxes dict referenced above
        var listOfItems = {};
        var trs = $(tableItem).find("tr");
        // trs[0] is the name of the bundle, so we will skip it.
        // trs[trs.length] is info about the reward, so we skip that too.
        for (var i = 1; i < trs.length - 1; i++) {
            // We want to skip the gold bundles. This will break if any single-item bundles come out in the future, but at this point the bundle system doesn't really seem to work that way so it's probably fine.
            if (trs.length == 3) {
                continue;
            }
            var itemtd;
            // i = 0 is a special case because the first two tds are the image and the checkboxes
            if (i == 1) {
                itemtd = $(trs[i]).find("td")[2];
            }
            else {
                itemtd = $(trs[i]).find("td")[0];
            }
            var item = $(itemtd).find("#nametemplate");
            var itemName = item.text().trim();
            // "The missing bundle" has weird extra tds, so if we can't find an item name we'll just skip it.
            if (itemName == undefined || item.length == 0) {
                continue;
            }
            var index = itemName.indexOf("(");
            if (index != -1) {
                itemName = itemName.substr(0, index - 1);
            }
            if (itemName != "" && item[0]) {
                listOfItems[itemName] = item[0];
            }
        }
        bundleDict[bundleName] = listOfItems;

        var itemsToCheck = (localStorage.getItem(bundleName) || "").split(",");
        // Create the checkboxes
        for (const checkItem in bundleDict[bundleName]) {
            var nametemplate = bundleDict[bundleName][checkItem];
            var newCheckbox = document.createElement("input");
            $(newCheckbox).attr("type", "checkbox");
            $(newCheckbox).attr("data-bundle-name", bundleName);
            $(newCheckbox).attr("data-item-name", checkItem);
            // Register an event to add/remove items from localstorage
            $(newCheckbox).on("click", (event) => {
                var sender = event.target;  
                var bundleName = $(sender).attr("data-bundle-name");
                var itemName = $(sender).attr("data-item-name");
                var storageBundleItems = (localStorage.getItem(bundleName) || "").split(",");
                if (storageBundleItems[0] == "") {
                    storageBundleItems.splice(0, 1);
                }
                var index = storageBundleItems.indexOf(itemName);
                if (index >= 0) {
                    // Record that it's no longer clicked
                    storageBundleItems.splice(index, 1);
                }
                else {
                    storageBundleItems.push(itemName);
                }
                // Remove the key if no more items are checked in that table
                if (storageBundleItems.length == 0) {
                    localStorage.removeItem(bundleName);
                } else {
                    localStorage.setItem(bundleName, storageBundleItems);
                }
            });
            if (itemsToCheck && itemsToCheck.indexOf(checkItem) >= 0) {
                $(newCheckbox).attr("checked", "true");
            }
            nametemplate.prepend(newCheckbox);
        };
    }
});