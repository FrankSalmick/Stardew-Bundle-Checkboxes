// TODO: Make a way for users to update this value. I have it set to two, one for "I have collected this item" and one for "I have turned it in"
const checkboxesPerRow = 2;
var bundles = {};

// The function to handle a click event on the checkboxes. It needs to be defined above the main loop, but the code might make more sense if you read the loop first.
const processClick = function(event) {
    var sender = event.target;  
    var bundleName = $(sender).attr("data-bundle-name");
    var itemName = $(sender).attr("data-item-name");
    var storageBundleItems = (localStorage.getItem(bundleName) || "").split(",");
    var index = storageBundleItems.indexOf(itemName);
    if (index >= 0) {
        // Record that it's no longer checked
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
}

// Insert the checkboxes. Since we set run_at to document_idle in the manifest, we don't need to wait for the document to complete.
$("tbody").each((iteration, tbody) => {
    // Multiple parts of this expression could be undefined or null, so we just try/catch it instead of having a check for every single possibility. If it fails at any point, it will just be undefined, which we can check for.
    var bundleName;
    try {
        bundleName = $(tbody).find("tr").first().find("th").first().attr("id");
    } catch(e) { }
    if (bundleName != undefined) {
        // This will be a dictionary of {itemName: HTML object that holds the name of the in-game object}
        // The HTML object is not always the same kind (sometimes it is a span, others it is a table), but we are only going to prepend things to it and examine its innerText, so we don't care.
        var listOfItems = {};
        var rows = $(tbody).find("tr");
        // rows[0] is the name of the bundle, so we will skip it.
        // rows[rows.length] is info about the reward, so we skip that too.
        for (var i = 1; i < rows.length; i++) {
            // We want to skip the gold bundles. This will break if any single-item bundles come out in the future, but with the way the current bundles are balanced I don't think that will happen.
            if (rows.length == 3) {
                continue;
            }
            var tdOfItem = $(rows[i]).find("td")[0];
            // i = 1 is a special case because the first two tds are the image and the checkboxes, the item is stored in the third td.
            if (i == 1) {
                tdOfItem = $(rows[i]).find("td")[2];
            }
            var item = $(tdOfItem).find("#nametemplate");
            // Some items are stored as tables instead of a span. If we can't find the item, it's a table.
            if (item.length == 0) {
                item = $(tdOfItem).find("tbody").first().find("tr").first();
            }
            var itemName = item.text().trim();
            // There are some trs that just hold random data, but don't have a subtable or #nametemplate. If we hit one of these, we just skip it.
            if (itemName != "" && item[0]) {
                // Support multiple items of the same name
                if (listOfItems[itemName] != undefined) {
                    // Increment duplicateID until we find the next unused item name
                    var duplicateID = 1;
                    for (; listOfItems[itemName + "-dup-" + duplicateID] != undefined; duplicateID++);
                    itemName += "-dup-" + duplicateID;
                }
                listOfItems[itemName] = item[0];
            }
        }
        bundles[bundleName] = listOfItems;

        // Create the checkboxes for this table
        var itemsToCheck = (localStorage.getItem(bundleName) || "").split(",");
        for (var itemName in bundles[bundleName]) {
            for (var i = 0; i < checkboxesPerRow; i++) {
                // Store a reference to the html object for later before we change itemName
                var htmlNameObject = bundles[bundleName][itemName];
                var itemNameWithTag = itemName + "-" + i;
                var newCheckbox = document.createElement("input");
                $(newCheckbox).attr("type", "checkbox");
                $(newCheckbox).attr("data-bundle-name", bundleName);
                $(newCheckbox).attr("data-item-name", itemNameWithTag);
                $(newCheckbox).on("click", processClick);
                // itemsToCheck might be null if the user hasn't checked any boxes in that bundle yet.
                if (itemsToCheck && itemsToCheck.indexOf(itemNameWithTag) >= 0) {
                    $(newCheckbox).attr("checked", "true");
                }
                htmlNameObject.prepend(newCheckbox);
            }
        };
    }
});