'use strict';

const MIRROR = 'Mirror of Kalandra';
const EXALT = 'Exalted Orb';
const PRICE_KEY = 'price';
const QUANTITY_PURCHASED_KEY = 'quantity_purchased';

let addedRowListener = false;
let isExchangeTabActive = window.location.pathname.includes('exchange');

window.addEventListener("DOMSubtreeModified", addRowListenerHandler);
window.addEventListener('click', function () {
    isExchangeTabActive = document.querySelector('li.active').innerHTML.includes('exchange');
});

function addRowListenerHandler() {
    if (!addedRowListener) {
        let resultsContainer = document.getElementsByClassName('results');
        if (resultsContainer.length) {
            addedRowListener = true;
            resultsContainer = resultsContainer[0];
            resultsContainer.addEventListener("DOMNodeInserted", addButtonClickListener);
        }
    }
}

function addButtonClickListener(event) {
    const row = event.target;
    // if no data-id then this isn't a valid row to add a button to
    if (row != null && row.getAttribute('data-id')) {
        // don't show button for mirrors since they are not supported
        const fromCurrencyType = row.querySelector('.price-right .currency-text').innerText;
        if (fromCurrencyType === MIRROR) {
            return;
        }

        const rowID = row.getAttribute('data-id');
        const fromPrice = Number(row.querySelector('.price-right > .price-block > span:first-child').innerText);
        const toPrice = Number(row.querySelector('.price-left > .price-block > span:last-child').innerText);
        const toCurrencyType = row.querySelector('.price-left .currency-text').innerText;
        const stock = Number(row.querySelector('.stock > span').innerText);
        const calculatePriceReturn = calculatePrice(stock, fromPrice, toPrice, fromCurrencyType, toCurrencyType);
        const price = calculatePriceReturn[PRICE_KEY];
        const quantityPurchased = calculatePriceReturn[QUANTITY_PURCHASED_KEY];
        const bulkPurchaseElementID = `${rowID}_bulkPurchaseMessage`;

        // add input containing message to copy
        let bulkPurchaseInput = document.createElement('input');
        bulkPurchaseInput.type = 'text';
        bulkPurchaseInput.id = bulkPurchaseElementID;
        bulkPurchaseInput.classList.add('hidden');
        row.append(bulkPurchaseInput);

        // create button
        let button = document.createElement("button");
        button.innerHTML = 'Buy All';
        button.classList.add("btn", "btn-default");
        button.onclick = function () {
            if (row.querySelector('textarea') !== null) {
                const defaultMessage = row.querySelector('textarea').value;
                const message = getBulkPurchaseMessageV2(defaultMessage, quantityPurchased, price);
                bulkPurchaseInput.value = message;
                copyBulkPurchaseMessage(bulkPurchaseElementID);
            } else {
                alert('Please press the Contact... button before attempting to buy all');
            }
        };
        row.querySelector('.btns > .pull-left').append(button);
    }
}

function calculatePrice(stock, from, to, fromCurrencyType, toCurrencyType) {
    const baseCalc = (stock / to) * from;
    let finalPrice = baseCalc;
    let purchaseQuantity = stock;

    /*
    from type      to type       baseCalc is whole number   behavior
    ex             non mirror    yes                        normal buy max
                                 no                         round to nearest ex, update purchaseQuantity
    ex             mirror        yes                        normal buy max
                                 no                         round to nearest tenth
    non ex         any           yes                        normal/buy max
                                 no                         round to nearest one
    */
    if (fromCurrencyType === EXALT && toCurrencyType !== MIRROR) {
        if (!isWholeNumber(baseCalc)) {
            // round to nearest ex, update purchaseQuantity
            const batches = Math.floor(stock / to);
            finalPrice = batches * from;
            purchaseQuantity = batches * to;
        }
    } else if (fromCurrencyType === EXALT && toCurrencyType === MIRROR) {
        // else, round up to the nearest tenth place
        // 6.09 + .05 = 6.14 * 10 = 61.4 -> 61 / 10 = 6.1
        // 6.01 + .05 = 6.06 * 10 = 60.6 -> 61 / 10 = 6.1
        if (!isWholeNumber(baseCalc)) {
            finalPrice = Math.round((baseCalc + .05) * 10) / 10;
        }
    } else {
        if (!isWholeNumber(baseCalc)) {
            finalPrice = Math.ceil(baseCalc);
        }
    }

    return {[PRICE_KEY]: finalPrice, [QUANTITY_PURCHASED_KEY]: purchaseQuantity}
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

function getBulkPurchaseMessageV2(defaultMessage, stock, price) {
    // TODO add edge case catch for korean and german
    // german "'123"
    // korean "<characters>123"
    const messageParts = defaultMessage.split(" ");
    const firstNumberIndex = messageParts.findIndex(stringIsNumber);
    messageParts[firstNumberIndex] = stock;
    const secondNumberIndex = messageParts.findIndex(stringIsNumber);
    messageParts[secondNumberIndex] = price;
    return messageParts.join(' ');
}

function stringIsNumber(s) {
    return String(Number(s)) === s;
}

function isWholeNumber(num) {
    return num - Math.floor(num) === 0;
}