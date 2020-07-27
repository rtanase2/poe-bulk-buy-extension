'use strict';

let listenerAdded = false;
window.addEventListener("DOMSubtreeModified", function(_) {
    let resultsContainer = document.getElementsByClassName('results');
    if (resultsContainer.length && !listenerAdded) {
        listenerAdded = true;
        resultsContainer = resultsContainer[0];
        resultsContainer.addEventListener("DOMNodeInserted", function(event) {
            const row = event.target;
            // if no data-id then this isn't a valid row to add a button to
            if(row != null && row.getAttribute('data-id')) {
                // don't show button for mirrors since they are not supported
                const fromCurrencyType = row.querySelector('.price-right .currency-text').innerText;
                if (fromCurrencyType === 'Mirror of Kalandra') {
                    return;
                }

                const rowID = row.getAttribute('data-id');
                const characterName = row.querySelector('.character-name').innerText.split(': ')[1];
                const fromPrice = Number(row.querySelector('.price-right > .price-block > span:first-child').innerText);
                const toPrice = Number(row.querySelector('.price-left > .price-block > span:last-child').innerText);
                const toCurrencyType = row.querySelector('.price-left .currency-text').innerText;
                const stock = Number(row.querySelector('.stock > span').innerText);
                const leagueName = row.querySelector('.status').getAttribute('title');
                const price = calculatePriceForAll(stock, fromPrice, toPrice, fromCurrencyType);
                const message = getBulkPurchaseMessage(characterName, stock, toCurrencyType, price, fromCurrencyType, leagueName);
                const bulkPurchaseElementID = `${rowID}_bulkPurchaseMessage`;

                // add input containing message to copy
                let bulkPurchaseInput = document.createElement('input');
                bulkPurchaseInput.type = 'text';
                bulkPurchaseInput.value = message;
                bulkPurchaseInput.id = bulkPurchaseElementID;
                bulkPurchaseInput.classList.add('hidden');
                row.append(bulkPurchaseInput);

                // create button
                let button = document.createElement("button");
                button.innerHTML = 'Buy All';
                button.classList.add("btn", "btn-default");
                button.onclick = function(_) {
                    copyBulkPurchaseMessage(bulkPurchaseElementID);
                };
                row.querySelector('.btns > .pull-left').append(button);
            }

            // TODO don't add button for mirrors (alternatively, could add alert saying we don't eval mirrors)
            // TODO if breaking ex into smaller currency, only buy the amount that === full exalt, no decimals
            // TODO update icon
            // TODO Fix formatting if screen width is narrow
        });
    }
});

function calculatePriceForAll(stock, from, to, fromCurrencyType) {
    const baseCalc = (stock/to)*from;
    switch(fromCurrencyType) {
        case 'Exalted Orb':
            // if it's a whole number, return that
            if (baseCalc - Math.floor(baseCalc) === 0) {
                return baseCalc;
            }
            // else, round up to the nearest tenth place
            // 6.09 + .05 = 6.14 * 10 = 61.4 -> 61 / 10 = 6.1
            // 6.01 + .05 = 6.06 * 10 = 60.6 -> 61 / 10 = 6.1
            return Math.round((baseCalc + .05) * 10) / 10;
        default:
            return Math.ceil(baseCalc);
    }
}

function copyBulkPurchaseMessage(elementID) {
    let copyInput = document.getElementById(elementID);
    // show input so we can copy value
    copyInput.classList.remove('hidden');
    copyInput.select();
    document.execCommand("copy");
    // hide input because who needs to see inputs. gross
    copyInput.classList.add('hidden');
}

function getBulkPurchaseMessage(characterName, stock, toCurrencyType, price, fromCurrencyType, leagueName) {
    return `@${characterName} Hi, I'd like to buy your ${stock} ${toCurrencyType} for my ${price} ${fromCurrencyType} in ${leagueName}.`;
}
