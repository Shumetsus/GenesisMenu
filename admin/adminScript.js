document.addEventListener('DOMContentLoaded', function () {
    const orderList = document.getElementById('orderList');
    const customerOrderList = document.getElementById('customerOrderList');
    const clearOrdersButton = document.getElementById('clearOrdersButton');
    const password = 'bigblacknigga';
    const conversionRate = 4100;

    const updateOrderDisplay = () => {
        const orders = JSON.parse(localStorage.getItem('foodOrders')) || {};

        orderList.innerHTML = '';
        customerOrderList.innerHTML = '';

        Object.keys(orders).forEach(customer => {
            if (Array.isArray(orders[customer])) {
                const customerLi = document.createElement('li');
                let totalOrderCostUSD = 0;
                let discountInfo = "";

                const orderDetails = orders[customer].map(order => {
                    if (order.food) {
                        const orderCostUSD = order.price * order.quantity;
                        totalOrderCostUSD += orderCostUSD;
                        return `${order.food} x ${order.quantity} ($${orderCostUSD.toFixed(2)})`;
                    } else if (order.discount) {
                        discountInfo = `Discount Applied: ${order.discountPercent}% - $${order.discount} off`;
                        totalOrderCostUSD -= parseFloat(order.discount);
                    }
                }).join(', ');

                const totalOrderCostKHR = totalOrderCostUSD * conversionRate;
                customerLi.textContent = `Orders for ${customer}: ${orderDetails} - Total after ${discountInfo}: $${totalOrderCostUSD.toFixed(2)} (៛${totalOrderCostKHR.toLocaleString()})`;

                const allDone = orders[customer].every(order => order.completed);

                if (!allDone) {
                    const markAsDoneButton = document.createElement('button');
                    markAsDoneButton.textContent = 'Mark as Done';
                    markAsDoneButton.addEventListener('click', function () {
                        markOrderAsDone(customer, orders[customer], totalOrderCostUSD, totalOrderCostKHR);
                        orders[customer].forEach(order => order.completed = true);
                        localStorage.setItem('foodOrders', JSON.stringify(orders));
                        updateOrderDisplay();
                    });
                    customerLi.appendChild(markAsDoneButton);
                } else {
                    customerLi.style.textDecoration = 'line-through';
                    customerLi.style.color = 'gray';
                }

                customerOrderList.appendChild(customerLi);
            }
        });
    };

    const markOrderAsDone = (customer, items, totalPriceUSD, totalPriceKHR) => {
        const completedOrder = {
            customer,
            items,
            totalPriceUSD,
            totalPriceKHR
        };

        fetch('http://localhost:3000/logOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(completedOrder)
        })
        .then(response => response.text())
        .then(responseMessage => {
            console.log(responseMessage);
            alert(`Order for ${customer} marked as done and logged.`);
        })
        .catch(error => {
            console.error("Error logging completed order:", error);
        });
    };

    const deleteCustomerOrders = (customer) => {
        let orders = JSON.parse(localStorage.getItem('foodOrders')) || {};
        if (orders[customer]) {
            delete orders[customer];
            localStorage.setItem('foodOrders', JSON.stringify(orders));
            updateOrderDisplay();
            alert(`All orders for ${customer} have been deleted.`);
        }
    };

    updateOrderDisplay();

    window.addEventListener('storage', function (event) {
        if (event.key === 'foodOrders') {
            updateOrderDisplay();
        }
    });

    clearOrdersButton.addEventListener('click', function () {
        const security_code = prompt("Please enter the password to clear all orders");
        if (security_code === password) {
            localStorage.removeItem('foodOrders');
            updateOrderDisplay();
            alert("All orders have been cleared!");
        } else {
            alert("Wrong Password");
        }
    });
});
