# Requirements Document

## Introduction

This document defines the requirements for the E-Commerce Web Application — a full-stack TypeScript monorepo platform that allows customers to browse products, manage a shopping cart, place orders, and track order history, while providing administrators with tools to manage the product catalog, monitor orders, and view dashboard statistics.

The application is structured as a Turborepo monorepo with a React SPA frontend (`apps/web`), an Express REST API backend (`apps/server`), and shared packages for API contracts, authentication, and database models. Authentication is JWT-based; cart state is managed client-side and persisted to `localStorage`; payments are processed via Stripe.

---

## Glossary

- **System**: The E-Commerce Web Application as a whole.
- **Frontend**: The React SPA served from `apps/web`.
- **API**: The Express REST API served from `apps/server`.
- **User**: An authenticated customer with role `"user"`.
- **Admin**: An authenticated user with role `"admin"`.
- **Guest**: An unauthenticated visitor.
- **Product**: A catalog item with name, description, price, category, stock count, and image.
- **Cart**: The client-side collection of products a User intends to purchase, persisted to `localStorage`.
- **CartItem**: A single entry in the Cart, containing a product reference, quantity, and a price snapshot.
- **Order**: A confirmed purchase record stored in the database, containing order items, shipping address, payment method, total price, and status.
- **OrderItem**: A line item within an Order, containing a product reference, name, image, price snapshot, and quantity.
- **ShippingAddress**: A structured address object containing street address, city, postal code, and country.
- **OrderStatus**: One of the enumerated values: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.
- **JWT**: A JSON Web Token issued by the API upon successful authentication, used to authorize subsequent requests.
- **Stripe**: The third-party payment processing service used for card payments.
- **AuthContext**: The React context that holds the current User's session state on the Frontend.
- **CartContext**: The React context that holds the current Cart state on the Frontend.
- **ProtectedRoute**: A Frontend route wrapper that redirects unauthenticated visitors to `/login`.
- **AdminRoute**: A Frontend route wrapper that redirects non-Admin users to the home page.
- **Zod**: The TypeScript-first schema validation library used for request body validation on the API.
- **ts-rest**: The contract-first REST library used to define shared API types between Frontend and API.

---

## Requirements

### Requirement 1: Product Browsing

**User Story:** As a Guest or User, I want to browse the product catalog with search, filter, and sort capabilities, so that I can quickly find products that match my interests.

#### Acceptance Criteria

1. THE Frontend SHALL display a paginated or scrollable list of Products on the products page, showing each Product's image, name, price, and category.
2. WHEN a Guest or User submits a search term, THE Frontend SHALL send the search term to the API and display only Products whose names contain the search term (case-insensitive).
3. WHEN a Guest or User selects a category filter, THE API SHALL return only Products belonging to the selected category.
4. WHEN a Guest or User selects a sort option, THE API SHALL return Products ordered by price in the selected direction (ascending or descending).
5. WHEN multiple filters are applied simultaneously (search term, category, and sort), THE API SHALL apply all active filters and sort orders together in a single response.
6. WHEN no Products match the applied filters, THE Frontend SHALL display a message indicating that no products were found.
7. WHEN a Guest or User selects a Product from the listing, THE Frontend SHALL navigate to the Product detail page displaying the full description, price, stock count, and an add-to-cart control.
8. WHILE product data is loading, THE Frontend SHALL display a loading indicator in place of the product list.
9. IF the API returns an error when fetching Products, THEN THE Frontend SHALL display an error message to the Guest or User.

---

### Requirement 2: Authentication

**User Story:** As a Guest, I want to register and log in to the application, so that I can access protected features such as placing orders and viewing my profile.

#### Acceptance Criteria

1. WHEN a Guest submits a registration form with a valid name, email, and password, THE API SHALL create a new User account with role `"user"`, hash the password using bcrypt, and return a JWT.
2. WHEN a Guest submits a login form with a valid email and password, THE API SHALL verify the credentials and return a JWT along with the User's name, email, and role.
3. WHEN a Guest submits a registration or login form with an invalid email format, a password shorter than 6 characters, or a missing required field, THE API SHALL return a 400 response with a descriptive error message.
4. WHEN a Guest attempts to register with an email address that already exists, THE API SHALL return a 400 response indicating the email is already in use.
5. WHEN a request is made to a protected API endpoint without a valid JWT in the `Authorization: Bearer` header, THE API SHALL return a 401 response.
6. WHEN a request is made to a protected API endpoint with a valid JWT, THE API SHALL attach the authenticated User's identity to the request and proceed.
7. WHEN an authenticated User requests their profile, THE API SHALL return the User's name, email, role, and account creation date.
8. WHEN a User logs out, THE Frontend SHALL remove the JWT from `localStorage` and clear the AuthContext, redirecting the User to the home page.
9. WHILE a User is authenticated, THE Frontend SHALL display the User's name in the navigation bar along with a logout option.

---

### Requirement 3: Shopping Cart

**User Story:** As a User or Guest, I want to manage a shopping cart that persists across page refreshes, so that I can collect products before proceeding to checkout.

#### Acceptance Criteria

1. THE CartContext SHALL persist the Cart to `localStorage` under the key `"cart"` after every state change, and restore the Cart from `localStorage` on application load.
2. WHEN a User or Guest adds a Product to the Cart that is not already present, THE CartContext SHALL add a new CartItem with quantity 1.
3. WHEN a User or Guest adds a Product to the Cart that is already present, THE CartContext SHALL increment the existing CartItem's quantity by 1 rather than creating a duplicate entry.
4. WHEN a User or Guest removes a CartItem from the Cart, THE CartContext SHALL remove the entry with the matching product ID so that no CartItem with that product ID remains in the Cart.
5. WHEN a User or Guest updates the quantity of a CartItem, THE CartContext SHALL update the quantity to the specified value, subject to the stock cap in criterion 6.
6. WHEN the quantity of a CartItem would exceed the Product's available stock, THE CartContext SHALL cap the quantity at the Product's stock value and SHALL NOT allow the quantity to exceed it.
7. WHEN a Product has a stock count of 0, THE Frontend SHALL disable the add-to-cart button on the Product detail page.
8. THE Frontend SHALL display the total number of items in the Cart as a badge on the cart icon in the navigation bar.
9. THE Frontend SHALL compute and display the Cart's total price as the sum of `price × quantity` across all CartItems.
10. WHEN a User or Guest clears the Cart, THE CartContext SHALL remove all CartItems and update `localStorage` accordingly.

---

### Requirement 4: Checkout

**User Story:** As a User, I want to complete a purchase by providing a shipping address and selecting a payment method, so that I can place an order for the items in my Cart.

#### Acceptance Criteria

1. WHEN a Guest attempts to access the checkout page, THE Frontend SHALL redirect the Guest to the login page via the ProtectedRoute.
2. WHEN a User submits the checkout form with a valid ShippingAddress and payment method, THE API SHALL create an Order containing the CartItems as OrderItems, with each OrderItem's price snapshotted at the current Product price.
3. THE API SHALL compute the Order's `totalPrice` as the sum of `price × quantity` across all OrderItems and store it on the Order document.
4. WHEN an Order is successfully placed, THE Frontend SHALL clear the Cart and navigate the User to the order confirmation or order details page.
5. WHEN a User selects "Stripe" as the payment method, THE Frontend SHALL initiate a Stripe payment flow before submitting the order to the API.
6. WHEN a User submits the checkout form with a missing or incomplete ShippingAddress field, THE Frontend SHALL display a validation error and SHALL NOT submit the order to the API.
7. IF the API returns an error when placing an Order, THEN THE Frontend SHALL display an error message and retain the Cart contents so the User can retry.
8. WHEN an Order is placed, THE API SHALL set the initial OrderStatus to `"Pending"`.

---

### Requirement 5: Order Management (User)

**User Story:** As a User, I want to view my order history and the details of individual orders, so that I can track the status of my purchases.

#### Acceptance Criteria

1. WHEN an authenticated User requests their order history, THE API SHALL return only Orders whose `user` field matches the authenticated User's ID.
2. THE Frontend SHALL display the User's order history as a list showing each Order's ID, date, total price, and current OrderStatus.
3. WHEN a User selects an Order from the history list, THE Frontend SHALL navigate to the order details page displaying the OrderItems, ShippingAddress, payment method, total price, and OrderStatus.
4. WHEN a User attempts to access an Order that does not belong to them, THE API SHALL return a 403 response.
5. WHILE order history data is loading, THE Frontend SHALL display a loading indicator.
6. IF the API returns an error when fetching order history, THEN THE Frontend SHALL display an error message.

---

### Requirement 6: Admin — Product Management

**User Story:** As an Admin, I want to create, update, and delete products in the catalog, so that I can keep the product inventory accurate and up to date.

#### Acceptance Criteria

1. WHEN an authenticated Admin submits a valid product creation form, THE API SHALL create a new Product document and return the created Product with its assigned ID.
2. WHEN an authenticated Admin submits a product update form for an existing Product, THE API SHALL update the Product's fields and return the updated Product document.
3. WHEN an authenticated Admin deletes a Product by ID, THE API SHALL remove the Product document and return a success confirmation.
4. WHEN a non-Admin User or unauthenticated request is made to a product write endpoint (`POST`, `PUT`, or `DELETE`), THE API SHALL return a 403 response.
5. WHEN an Admin submits a product form with a missing required field (name, description, price, category, or stock), THE API SHALL return a 400 response with a descriptive error message.
6. WHEN an Admin submits a product form with a negative price or negative stock value, THE API SHALL return a 400 response.
7. THE Frontend SHALL restrict access to product management pages using the AdminRoute, redirecting non-Admin users to the home page.
8. THE Frontend SHALL display a list of all Products on the manage products page with edit and delete controls for each entry.

---

### Requirement 7: Admin — Order Management

**User Story:** As an Admin, I want to view all orders across all users and update their statuses, so that I can manage the order fulfillment lifecycle.

#### Acceptance Criteria

1. WHEN an authenticated Admin requests all orders, THE API SHALL return every Order in the database regardless of which User placed it.
2. WHEN an authenticated Admin updates an Order's status to a valid OrderStatus value, THE API SHALL persist the new status and return the updated Order.
3. WHEN an authenticated Admin attempts to update an Order's status to a value outside the valid OrderStatus enum, THE API SHALL return a 400 response.
4. WHEN a non-Admin User or unauthenticated request is made to the admin order endpoints, THE API SHALL return a 403 response.
5. THE Frontend SHALL display all Orders on the manage orders page with controls to update each Order's status.
6. WHILE order data is loading on the admin manage orders page, THE Frontend SHALL display a loading indicator.

---

### Requirement 8: Admin — Dashboard Statistics

**User Story:** As an Admin, I want to view summary statistics on the admin dashboard, so that I can monitor the overall health and activity of the store.

#### Acceptance Criteria

1. THE Frontend SHALL display on the admin dashboard: total revenue (sum of all Order `totalPrice` values), total number of Orders, total number of Products, and the count of Orders with OrderStatus `"Pending"`.
2. WHEN an Admin navigates to the dashboard, THE Frontend SHALL fetch the required data from the API and compute the statistics before rendering them.
3. WHILE dashboard data is loading, THE Frontend SHALL display loading indicators in place of the statistic values.
4. THE Frontend SHALL restrict access to the admin dashboard using the AdminRoute, redirecting non-Admin users to the home page.

---

### Requirement 9: UI/UX — Responsive Design and Feedback

**User Story:** As a User or Guest, I want the application to be usable on any screen size and to receive clear feedback for all actions, so that I have a consistent and informative experience.

#### Acceptance Criteria

1. THE Frontend SHALL render all pages with a responsive layout that adapts to mobile (≤ 768 px), tablet (769 px – 1024 px), and desktop (≥ 1025 px) viewport widths using Tailwind CSS breakpoints.
2. WHEN an asynchronous operation is in progress (data fetch, form submission), THE Frontend SHALL display a loading indicator relevant to the operation.
3. WHEN a User or Guest performs a transient action (adding an item to the cart, placing an order), THE Frontend SHALL display a toast notification confirming the action using the `sonner` library.
4. WHEN a form submission fails due to a validation or API error, THE Frontend SHALL display an inline error message adjacent to the relevant field or at the top of the form.
5. WHEN a User or Guest navigates to a URL that does not match any defined route, THE Frontend SHALL render a 404 not-found page with a link back to the home page.
6. THE Frontend SHALL support light and dark color themes, persisting the User's theme preference across sessions.
7. THE Frontend SHALL display a navigation bar on all pages containing links to the product catalog, cart, and (when authenticated) the user menu.

---

### Requirement 10: Security — Input Validation and Access Control

**User Story:** As a system operator, I want all inputs to be validated and all routes to enforce role-based access control, so that the application is protected against invalid data and unauthorized access.

#### Acceptance Criteria

1. WHEN a request body is received by the API, THE API SHALL validate it against the corresponding Zod schema before processing, and return a 400 response with a descriptive message if validation fails.
2. WHEN a request is made to a User-protected endpoint without a valid JWT, THE API SHALL return a 401 response and SHALL NOT process the request.
3. WHEN a request is made to an Admin-only endpoint by a User whose role is not `"admin"`, THE API SHALL return a 403 response and SHALL NOT process the request.
4. THE API SHALL store all User passwords as bcrypt hashes and SHALL NOT store or return plaintext passwords in any response.
5. WHEN the API encounters an unhandled error in a production environment (`NODE_ENV === "production"`), THE API SHALL return a JSON error response that omits the stack trace and internal file paths.
6. WHEN the API encounters an unhandled error in a non-production environment, THE API SHALL include the stack trace in the error response to aid debugging.
7. THE API SHALL reject requests to undefined routes with a 404 response via the not-found middleware.
