const form =
    document.getElementById("orderForm");

const orderTableBody =
    document.getElementById("orderTableBody");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const totalOrders =
    document.getElementById("totalOrders");

const totalRevenue =
    document.getElementById("totalRevenue");

const formTitle =
    document.getElementById("formTitle");

const saveButton =
    document.getElementById("saveButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");


// Load saved orders
let orders =
    JSON.parse(localStorage.getItem("orders")) || [];


// -1 means we are NOT editing
let editingIndex = -1;


// Save orders
function saveOrders() {

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

}


// Update dashboard
function updateSummary() {

    totalOrders.textContent =
        orders.length;


    let revenue = 0;


    orders.forEach(function(order) {

        revenue +=
            Number(order.quantity)
            *
            Number(order.price);

    });


    totalRevenue.textContent =
        "$" + revenue.toFixed(2);

}


// Display orders
function displayOrders() {

    orderTableBody.innerHTML = "";


    const searchText =
        searchInput.value.toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const filteredOrders =
        orders.filter(function(order) {


            const matchesSearch =

                order.customer
                    .toLowerCase()
                    .includes(searchText)

                ||

                order.product
                    .toLowerCase()
                    .includes(searchText);


            const matchesStatus =

                selectedStatus === "All"

                ||

                order.status === selectedStatus;


            return matchesSearch && matchesStatus;

        });


    filteredOrders.forEach(function(order) {


        const originalIndex =
            orders.indexOf(order);


        const row =
            document.createElement("tr");


        const total =
            Number(order.quantity)
            *
            Number(order.price);


        row.innerHTML = `

            <td>${order.customer}</td>

            <td>${order.product}</td>

            <td>${order.quantity}</td>

            <td>
                $${Number(order.price).toFixed(2)}
            </td>

            <td>
                $${total.toFixed(2)}
            </td>

            <td>
                ${order.deliveryDate || "-"}
            </td>

            <td>
                ${order.status || "New"}
            </td>

            <td>

                <button
                    class="edit-button"
                    onclick="editOrder(${originalIndex})"
                >
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteOrder(${originalIndex})"
                >
                    Delete
                </button>

            </td>

        `;


        orderTableBody.appendChild(row);

    });


    updateSummary();

}


// Save or update order
form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const customer =
            document.getElementById("customer").value;

        const product =
            document.getElementById("product").value;

        const quantity =
            document.getElementById("quantity").value;

        const price =
            document.getElementById("price").value;

        const deliveryDate =
            document.getElementById("deliveryDate").value;

        const status =
            document.getElementById("status").value;


        const orderData = {

            customer: customer,

            product: product,

            quantity: quantity,

            price: price,

            deliveryDate: deliveryDate,

            status: status

        };


        // ADD NEW ORDER
        if (editingIndex === -1) {

            orders.push(orderData);

        }

        // UPDATE EXISTING ORDER
        else {

            orders[editingIndex] =
                orderData;

        }


        saveOrders();

        displayOrders();

        resetForm();

    }
);


// Edit order
function editOrder(index) {

    const order =
        orders[index];


    document.getElementById("customer").value =
        order.customer;

    document.getElementById("product").value =
        order.product;

    document.getElementById("quantity").value =
        order.quantity;

    document.getElementById("price").value =
        order.price;

    document.getElementById("deliveryDate").value =
        order.deliveryDate || "";

    document.getElementById("status").value =
        order.status || "New";


    editingIndex = index;


    formTitle.textContent =
        "Edit Order";

    saveButton.textContent =
        "Update Order";

    cancelEditButton.style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// Delete order
function deleteOrder(index) {

    orders.splice(index, 1);

    saveOrders();

    displayOrders();


    if (editingIndex === index) {

        resetForm();

    }

}


// Reset form
function resetForm() {

    form.reset();


    editingIndex = -1;


    formTitle.textContent =
        "Add New Order";


    saveButton.textContent =
        "Save Order";


    cancelEditButton.style.display =
        "none";

}


// Cancel editing
cancelEditButton.addEventListener(
    "click",
    resetForm
);


// Search
searchInput.addEventListener(
    "input",
    displayOrders
);


// Filter
statusFilter.addEventListener(
    "change",
    displayOrders
);


// First display
displayOrders();