// ==========================================
// SUPABASE CONFIG
// ==========================================

const SUPABASE_URL =
    "https://jtyezjbaijtrlcytcwss.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_z_Yck3uKIdbXFwcspskCMg_0QebwUVO";


// Kết nối Supabase
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// 2. LẤY CÁC THÀNH PHẦN HTML
// ==========================================

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


// ==========================================
// 3. VARIABLES
// ==========================================

let currentUser = null;

let orders = [];

let editingId = null;


// ==========================================
// 4. SIGN UP
// ==========================================

signupForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("signupEmail").value;

        const password =
            document.getElementById("signupPassword").value;

        authMessage.textContent =
            "Creating account...";


        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password

            });


        if (error) {

            authMessage.textContent =
                "Error: " + error.message;

            return;

        }


        if (data.session) {

            authMessage.textContent =
                "Account created successfully.";

        } else {

            authMessage.textContent =
                "Account created. Check your email.";

        }


        signupForm.reset();
    }
);


// ==========================================
// 5. LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;


        authMessage.textContent =
            "Logging in...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            authMessage.textContent =
                "Login error: " + error.message;

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


// ==========================================
// 6. LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        currentUser = null;

        orders = [];

        showLogin();
    }
);


// ==========================================
// 7. SHOW LOGIN
// ==========================================

function showLogin() {

    authSection.style.display =
        "block";

    appSection.style.display =
        "none";
}


// ==========================================
// 8. SHOW APP
// ==========================================

async function showApp() {

    authSection.style.display =
        "none";

    appSection.style.display =
        "block";

    loggedInEmail.textContent =
        currentUser.email;

    await loadOrders();
}


// ==========================================
// 9. LOAD ORDERS
// ==========================================

async function loadOrders() {

    const { data, error } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                { ascending: false }
            );


    if (error) {

        orderMessage.textContent =
            "Error loading orders: "
            + error.message;

        return;
    }


    orders = data || [];

    orderMessage.textContent = "";

    displayOrders();
}


// ==========================================
// 10. SAVE / UPDATE ORDER
// ==========================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const customer =
            document.getElementById("customer").value;

        const product =
            document.getElementById("product").value;

        const quantity =
            Number(
                document.getElementById("quantity").value
            );

        const price =
            Number(
                document.getElementById("price").value
            );

        const deliveryDate =
            document.getElementById("deliveryDate").value;

        const status =
            document.getElementById("status").value;


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


        // ADD
        if (editingId === null) {

            const { error } =
                await supabaseClient
                    .from("orders")
                    .insert(orderData);


            if (error) {

                orderMessage.textContent =
                    "Error: " + error.message;

                return;
            }

        }

        // UPDATE
        else {

            const { error } =
                await supabaseClient
                    .from("orders")
                    .update(orderData)
                    .eq("id", editingId);


            if (error) {

                orderMessage.textContent =
                    "Error: " + error.message;

                return;
            }
        }


        resetForm();

        await loadOrders();
    }
);


// ==========================================
// 11. DISPLAY ORDERS
// ==========================================

function displayOrders() {

    orderTableBody.innerHTML =
        "";


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
                ${order.delivery_date || "-"}
            </td>

            <td>
                ${order.status || "New"}
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


        orderTableBody.appendChild(row);
    });


    updateSummary();
}


// ==========================================
// 12. EDIT
// ==========================================

function editOrder(id) {

    const order =
        orders.find(function(item) {

            return item.id === id;

        });


    if (!order) {
        return;
    }


    document.getElementById("customer").value =
        order.customer;

    document.getElementById("product").value =
        order.product;

    document.getElementById("quantity").value =
        order.quantity;

    document.getElementById("price").value =
        order.price;

    document.getElementById("deliveryDate").value =
        order.delivery_date || "";

    document.getElementById("status").value =
        order.status || "New";


    editingId =
        id;


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


// ==========================================
// 13. DELETE
// ==========================================

async function deleteOrder(id) {

    const confirmed =
        confirm(
            "Delete this order?"
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("orders")
            .delete()
            .eq("id", id);


    if (error) {

        orderMessage.textContent =
            "Delete error: "
            + error.message;

        return;
    }


    await loadOrders();
}


// ==========================================
// 14. DASHBOARD
// ==========================================

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


// ==========================================
// 15. RESET FORM
// ==========================================

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


cancelEditButton.addEventListener(
    "click",
    resetForm
);


searchInput.addEventListener(
    "input",
    displayOrders
);


statusFilter.addEventListener(
    "change",
    displayOrders
);


// ==========================================
// 16. CHECK USER WHEN WEBSITE OPENS
// ==========================================

async function checkSession() {

    const {
        data: { session }
    } =
        await supabaseClient.auth.getSession();


    if (session && session.user) {

        currentUser =
            session.user;

        await showApp();

    } else {

        showLogin();
    }
}


checkSession();