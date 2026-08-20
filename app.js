// =====================================================
// SUPABASE CONFIGURATION
// =====================================================


const SUPABASE_URL =
    "https://jtyezjbaijtrlcytcwss.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_z_Yck3uKIdbXFwcspskCMg_0QebwUVO";


// IMPORTANT:
// Only use the publishable key here.
// NEVER use service_role or secret key.


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



// =====================================================
// HTML ELEMENTS
// =====================================================


const authSection =
    document.getElementById("authSection");


const appSection =
    document.getElementById("appSection");


const signupForm =
    document.getElementById("signupForm");


const loginForm =
    document.getElementById("loginForm");


const logoutButton =
    document.getElementById("logoutButton");


const authMessage =
    document.getElementById("authMessage");


const loggedInEmail =
    document.getElementById("loggedInEmail");


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


const orderMessage =
    document.getElementById("orderMessage");


const orderMessageInput =
    document.getElementById("orderMessageInput");


const parseOrderButton =
    document.getElementById("parseOrderButton");


const parseMessage =
    document.getElementById("parseMessage");



// =====================================================
// VARIABLES
// =====================================================


let currentUser = null;


let orders = [];


let editingId = null;



// =====================================================
// SIGN UP
// =====================================================


signupForm.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("signupPassword")
                .value;


        authMessage.textContent =
            "Creating account...";


        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    emailRedirectTo:
                        "https://quan-ds1703.github.io/ordercleaner/"

                }

            });


        if (error) {

            authMessage.textContent =
                "Sign up error: "
                + error.message;

            return;

        }


        if (data.session) {

            currentUser =
                data.user;


            authMessage.textContent =
                "Account created successfully.";


            await showApp();

        }

        else {

            authMessage.textContent =
                "Account created. Check your email and confirm your account.";

        }


        signupForm.reset();

    }
);



// =====================================================
// LOGIN
// =====================================================


loginForm.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        authMessage.textContent =
            "Logging in...";


        const { data, error } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


        if (error) {

            authMessage.textContent =
                "Login error: "
                + error.message;

            return;

        }


        currentUser =
            data.user;


        authMessage.textContent =
            "";


        loginForm.reset();


        await showApp();

    }
);



// =====================================================
// LOGOUT
// =====================================================


logoutButton.addEventListener(
    "click",

    async function() {

        await supabaseClient.auth.signOut();


        currentUser =
            null;


        orders =
            [];


        showLogin();

    }
);



// =====================================================
// SHOW LOGIN
// =====================================================


function showLogin() {

    authSection.style.display =
        "block";


    appSection.style.display =
        "none";


    loggedInEmail.textContent =
        "";

}



// =====================================================
// SHOW APP
// =====================================================


async function showApp() {

    if (!currentUser) {

        showLogin();

        return;

    }


    authSection.style.display =
        "none";


    appSection.style.display =
        "block";


    loggedInEmail.textContent =
        currentUser.email;


    await loadOrders();

}



// =====================================================
// LOAD ORDERS FROM SUPABASE
// =====================================================


async function loadOrders() {

    orderMessage.textContent =
        "Loading orders...";


    const { data, error } =
        await supabaseClient

            .from("orders")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        orderMessage.textContent =
            "Error loading orders: "
            + error.message;

        return;

    }


    orders =
        data || [];


    orderMessage.textContent =
        "";


    displayOrders();

}



// =====================================================
// SAVE OR UPDATE ORDER
// =====================================================


form.addEventListener(
    "submit",

    async function(event) {

        event.preventDefault();


        if (!currentUser) {

            orderMessage.textContent =
                "Please login first.";

            return;

        }


        const customer =
            document
                .getElementById("customer")
                .value
                .trim();


        const product =
            document
                .getElementById("product")
                .value
                .trim();


        const quantity =
            Number(
                document
                    .getElementById("quantity")
                    .value
            );


        const price =
            Number(
                document
                    .getElementById("price")
                    .value
            );


        const deliveryDate =
            document
                .getElementById("deliveryDate")
                .value;


        const status =
            document
                .getElementById("status")
                .value;


        const orderData = {

            user_id:
                currentUser.id,

            customer:
                customer,

            product:
                product,

            quantity:
                quantity,

            price:
                price,

            delivery_date:
                deliveryDate || null,

            status:
                status

        };


        orderMessage.textContent =
            "Saving...";


        // ===========================
        // ADD NEW ORDER
        // ===========================

        if (editingId === null) {


            const { error } =
                await supabaseClient

                    .from("orders")

                    .insert(orderData);


            if (error) {

                orderMessage.textContent =
                    "Save error: "
                    + error.message;

                return;

            }


            orderMessage.textContent =
                "Order saved.";

        }


        // ===========================
        // UPDATE ORDER
        // ===========================

        else {


            const { error } =
                await supabaseClient

                    .from("orders")

                    .update(orderData)

                    .eq(
                        "id",
                        editingId
                    )

                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (error) {

                orderMessage.textContent =
                    "Update error: "
                    + error.message;

                return;

            }


            orderMessage.textContent =
                "Order updated.";

        }


        resetForm();


        orderMessageInput.value =
            "";


        parseMessage.textContent =
            "";


        await loadOrders();

    }
);



// =====================================================
// DISPLAY ORDERS
// =====================================================


function displayOrders() {

    orderTableBody.innerHTML =
        "";


    const searchText =
        searchInput
            .value
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const filteredOrders =
        orders.filter(

            function(order) {


                const customer =
                    (order.customer || "")
                        .toLowerCase();


                const product =
                    (order.product || "")
                        .toLowerCase();


                const matchesSearch =

                    customer.includes(
                        searchText
                    )

                    ||

                    product.includes(
                        searchText
                    );


                const matchesStatus =

                    selectedStatus ===
                        "All"

                    ||

                    order.status ===
                        selectedStatus;


                return (
                    matchesSearch
                    &&
                    matchesStatus
                );

            }

        );


    filteredOrders.forEach(

        function(order) {


            const row =
                document.createElement("tr");


            const total =

                Number(order.quantity)

                *

                Number(order.price);


            row.innerHTML = `

                <td>
                    ${escapeHtml(order.customer)}
                </td>

                <td>
                    ${escapeHtml(order.product)}
                </td>

                <td>
                    ${order.quantity}
                </td>

                <td>
                    $${Number(order.price).toFixed(2)}
                </td>

                <td>
                    $${total.toFixed(2)}
                </td>

                <td>
                    ${order.delivery_date || "-"}
                </td>

                <td>
                    ${escapeHtml(order.status || "New")}
                </td>

                <td>

                    <button
                        class="edit-button"
                        onclick="editOrder(${order.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteOrder(${order.id})"
                    >
                        Delete
                    </button>

                </td>

            `;


            orderTableBody
                .appendChild(row);

        }

    );


    updateSummary();

}



// =====================================================
// EDIT ORDER
// =====================================================


function editOrder(id) {

    const order =
        orders.find(

            function(item) {

                return item.id === id;

            }

        );


    if (!order) {

        return;

    }


    document
        .getElementById("customer")
        .value =
        order.customer;


    document
        .getElementById("product")
        .value =
        order.product;


    document
        .getElementById("quantity")
        .value =
        order.quantity;


    document
        .getElementById("price")
        .value =
        order.price;


    document
        .getElementById("deliveryDate")
        .value =
        order.delivery_date || "";


    document
        .getElementById("status")
        .value =
        order.status || "New";


    editingId =
        id;


    formTitle.textContent =
        "Edit Order";


    saveButton.textContent =
        "Update Order";


    cancelEditButton.style.display =
        "block";


    form.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}



// =====================================================
// DELETE ORDER
// =====================================================


async function deleteOrder(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this order?"
        );


    if (!confirmed) {

        return;

    }


    const { error } =
        await supabaseClient

            .from("orders")

            .delete()

            .eq(
                "id",
                id
            )

            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        orderMessage.textContent =
            "Delete error: "
            + error.message;

        return;

    }


    if (editingId === id) {

        resetForm();

    }


    await loadOrders();

}



// =====================================================
// DASHBOARD
// =====================================================


function updateSummary() {

    totalOrders.textContent =
        orders.length;


    let revenue =
        0;


    orders.forEach(

        function(order) {


            revenue +=

                Number(order.quantity)

                *

                Number(order.price);

        }

    );


    totalRevenue.textContent =

        "$"
        +
        revenue.toFixed(2);

}



// =====================================================
// RESET FORM
// =====================================================


function resetForm() {

    form.reset();


    editingId =
        null;


    formTitle.textContent =
        "Add New Order";


    saveButton.textContent =
        "Save Order";


    cancelEditButton.style.display =
        "none";

}



// =====================================================
// CANCEL EDIT
// =====================================================


cancelEditButton.addEventListener(

    "click",

    resetForm

);



// =====================================================
// SEARCH
// =====================================================


searchInput.addEventListener(

    "input",

    displayOrders

);



// =====================================================
// FILTER
// =====================================================


statusFilter.addEventListener(

    "change",

    displayOrders

);



// =====================================================
// SMART ORDER PARSER
// =====================================================


parseOrderButton.addEventListener(
    "click",

    function() {


        const text =
            orderMessageInput
                .value
                .trim();


        if (!text) {

            parseMessage.textContent =
                "Please paste an order message first.";

            return;

        }


        const lines =
            text
                .split("\n")
                .map(
                    function(line) {

                        return line.trim();

                    }
                )
                .filter(
                    function(line) {

                        return line !== "";

                    }
                );


        // ==================================
        // CUSTOMER
        // First non-empty line
        // ==================================


        let customer =
            "";


        if (lines.length > 0) {

            customer =
                lines[0];

        }



        // ==================================
        // PRICE
        // Example: $25 or $25.99
        // ==================================


        let price =
            "";


        const priceMatch =
            text.match(
                /\$\s*(\d+(?:\.\d{1,2})?)/
            );


        if (priceMatch) {

            price =
                priceMatch[1];

        }



        // ==================================
        // QUANTITY + PRODUCT
        // Example:
        // 2 Black T-Shirt
        // ==================================


        let quantity =
            1;


        let product =
            "";


        for (
            let i = 1;
            i < lines.length;
            i++
        ) {


            const line =
                lines[i];


            const match =
                line.match(
                    /^(\d+)\s*(?:x\s*)?(.+)$/i
                );


            if (match) {


                quantity =
                    Number(
                        match[1]
                    );


                product =
                    match[2];


                break;

            }

        }



        // ==================================
        // CLEAN PRODUCT
        // ==================================


        product =
            product
                .replace(
                    /\$\s*\d+(?:\.\d{1,2})?/g,
                    ""
                )
                .trim();



        // ==================================
        // DELIVERY DATE
        // Supports DD/MM/YYYY
        // ==================================


        let deliveryDate =
            "";


        const dateMatch =
            text.match(
                /(\d{1,2})\/(\d{1,2})\/(\d{4})/
            );


        if (dateMatch) {


            const day =
                dateMatch[1]
                    .padStart(
                        2,
                        "0"
                    );


            const month =
                dateMatch[2]
                    .padStart(
                        2,
                        "0"
                    );


            const year =
                dateMatch[3];


            deliveryDate =
                `${year}-${month}-${day}`;

        }



        // ==================================
        // FILL FORM
        // ==================================


        document
            .getElementById("customer")
            .value =
            customer;


        document
            .getElementById("product")
            .value =
            product;


        document
            .getElementById("quantity")
            .value =
            quantity;


        document
            .getElementById("price")
            .value =
            price;


        document
            .getElementById("deliveryDate")
            .value =
            deliveryDate;


        document
            .getElementById("status")
            .value =
            "New";


        parseMessage.textContent =
            "Order parsed. Check the details below before saving.";


        form.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }
);



// =====================================================
// ESCAPE HTML
// =====================================================


function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}



// =====================================================
// CHECK SESSION WHEN WEBSITE OPENS
// =====================================================


async function checkSession() {


    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();


    if (
        session
        &&
        session.user
    ) {


        currentUser =
            session.user;


        await showApp();

    }

    else {


        showLogin();

    }

}



// =====================================================
// START APPLICATION
// =====================================================


checkSession();