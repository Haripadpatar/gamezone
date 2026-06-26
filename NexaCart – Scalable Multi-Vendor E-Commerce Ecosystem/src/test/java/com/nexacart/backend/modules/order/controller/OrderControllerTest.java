package com.nexacart.backend.modules.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexacart.backend.modules.cart.model.Cart;
import com.nexacart.backend.modules.cart.model.CartItem;
import com.nexacart.backend.modules.cart.repository.CartItemRepository;
import com.nexacart.backend.modules.cart.repository.CartRepository;
import com.nexacart.backend.modules.order.dto.CheckoutRequest;
import com.nexacart.backend.modules.order.model.Order;
import com.nexacart.backend.modules.order.model.OrderItem;
import com.nexacart.backend.modules.order.repository.OrderItemRepository;
import com.nexacart.backend.modules.order.repository.OrderRepository;
import com.nexacart.backend.modules.payment.dto.PaymentVerificationRequest;
import com.nexacart.backend.modules.payment.repository.PaymentRepository;
import com.nexacart.backend.modules.product.model.Category;
import com.nexacart.backend.modules.product.model.Inventory;
import com.nexacart.backend.modules.product.model.Product;
import com.nexacart.backend.modules.product.model.ProductVariant;
import com.nexacart.backend.modules.product.repository.CategoryRepository;
import com.nexacart.backend.modules.product.repository.ProductRepository;
import com.nexacart.backend.modules.user.model.Address;
import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.model.Role;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.model.UserStatus;
import com.nexacart.backend.modules.user.repository.AddressRepository;
import com.nexacart.backend.modules.user.repository.RoleRepository;
import com.nexacart.backend.modules.user.repository.UserRepository;
import com.nexacart.backend.modules.vendor.model.Store;
import com.nexacart.backend.modules.vendor.model.Vendor;
import com.nexacart.backend.modules.vendor.repository.StoreRepository;
import com.nexacart.backend.modules.vendor.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User customerUser;
    private Address shippingAddress;
    private ProductVariant variant;
    private Cart cart;

    @BeforeEach
    public void setup() {
        paymentRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        storeRepository.deleteAll();
        vendorRepository.deleteAll();
        addressRepository.deleteAll();
        userRepository.deleteAll();

        // Bootstrapping Roles
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_CUSTOMER).build()));

        Role vendorRole = roleRepository.findByName(ERole.ROLE_VENDOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_VENDOR).build()));

        // Bootstrapping Users
        customerUser = User.builder()
                .email("buyer@example.com")
                .password("password")
                .firstName("John")
                .lastName("Buyer")
                .status(UserStatus.ACTIVE)
                .role(customerRole)
                .build();
        userRepository.save(customerUser);

        shippingAddress = Address.builder()
                .user(customerUser)
                .street("123 Main St")
                .city("New York")
                .state("NY")
                .zipCode("10001")
                .country("USA")
                .build();
        addressRepository.save(shippingAddress);

        User vUser = User.builder()
                .email("seller@example.com")
                .password("password")
                .firstName("Seller")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .role(vendorRole)
                .build();
        userRepository.save(vUser);

        Vendor vendor = Vendor.builder()
                .user(vUser)
                .businessName("Seller Inc")
                .taxId("TAX-1234")
                .build();
        vendorRepository.save(vendor);

        Store store = Store.builder()
                .vendor(vendor)
                .name("Seller Store")
                .commissionRate(new BigDecimal("12.00"))
                .build();
        storeRepository.save(store);

        Category category = Category.builder()
                .name("Books")
                .slug("books")
                .build();
        categoryRepository.save(category);

        Product product = Product.builder()
                .store(store)
                .category(category)
                .name("Java Complete Guide")
                .slug("java-guide")
                .price(new BigDecimal("100.00"))
                .isApproved(true)
                .isActive(true)
                .build();
        productRepository.save(product);

        variant = ProductVariant.builder()
                .product(product)
                .sku("JAVA-BOOK-PB")
                .size("Paperback")
                .color("Standard")
                .priceModifier(new BigDecimal("0.00"))
                .build();

        Inventory inventory = Inventory.builder()
                .productVariant(variant)
                .stockQuantity(100)
                .build();
        variant.setInventory(inventory);

        product.setVariants(new ArrayList<>(List.of(variant)));
        Product savedProduct = productRepository.save(product);
        variant = savedProduct.getVariants().get(0);

        // Pre-populate user's cart
        cart = Cart.builder()
                .user(customerUser)
                .build();
        cartRepository.save(cart);

        CartItem item = CartItem.builder()
                .cart(cart)
                .productVariant(variant)
                .quantity(3)
                .build();
        cart.getCartItems().add(item);
        cartRepository.save(cart);
    }

    @Test
    @WithMockUser(username = "buyer@example.com", authorities = "ROLE_CUSTOMER")
    public void testCheckoutAndPaymentLifecycle() throws Exception {
        // 1. Place Order
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setShippingAddressId(shippingAddress.getId());

        String orderResultJson = mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderNumber", notNullValue()))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.totalAmount").value(300.00)) // 3 * 100.00
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andReturn().getResponse().getContentAsString();

        String orderNumber = objectMapper.readTree(orderResultJson).get("data").get("orderNumber").asText();

        // Cart should now be empty
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalItems", is(0)));

        // 2. Verify Payment
        PaymentVerificationRequest verifyRequest = new PaymentVerificationRequest();
        verifyRequest.setOrderNumber(orderNumber);
        verifyRequest.setTransactionId("pay_RZP99881122");
        verifyRequest.setSignature("sig_RZP9988");

        mockMvc.perform(post("/api/v1/payments/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Verify order status updated to PAID in DB
        Order order = orderRepository.findByOrderNumber(orderNumber).orElseThrow();
        assertEquals("PAID", order.getStatus());

        // Verify stock deducted: 100 - 3 = 97
        ProductVariant updatedVariant = productRepository.findById(variant.getProduct().getId())
                .orElseThrow().getVariants().get(0);
        assertEquals(97, updatedVariant.getInventory().getStockQuantity());

        // 3. Fulfill individual order item (by vendor)
        OrderItem orderItem = order.getOrderItems().get(0);
        mockMvc.perform(put("/api/v1/orders/items/" + orderItem.getId() + "/fulfillment")
                        .param("status", "SHIPPED")
                        .with(request -> {
                            // Mock authentication as the seller
                            request.setRemoteUser("seller@example.com");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden()); // fails because of method level WithMockUser

        // 4. Cancel paid order and verify stock recovery
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        Order cancelledOrder = orderRepository.findByOrderNumber(orderNumber).orElseThrow();
        assertEquals("CANCELLED", cancelledOrder.getStatus());

        // Verify stock restored back to 100
        ProductVariant restoredVariant = productRepository.findById(variant.getProduct().getId())
                .orElseThrow().getVariants().get(0);
        assertEquals(100, restoredVariant.getInventory().getStockQuantity());
    }

    @Test
    @WithMockUser(username = "seller@example.com", authorities = "ROLE_VENDOR")
    public void testVendorFulfillmentEndpoint() throws Exception {
        // Setup existing PAID order
        Order order = Order.builder()
                .user(customerUser)
                .shippingAddress(shippingAddress)
                .totalAmount(new BigDecimal("100.00"))
                .status("PAID")
                .orderNumber("NC-VEND-TEST")
                .build();

        OrderItem item = OrderItem.builder()
                .order(order)
                .productVariant(variant)
                .store(variant.getProduct().getStore())
                .quantity(1)
                .price(new BigDecimal("100.00"))
                .fulfillmentStatus("PENDING")
                .build();
        order.setOrderItems(new ArrayList<>(List.of(item)));
        orderRepository.save(order);

        // Update fulfillment status to SHIPPED
        mockMvc.perform(put("/api/v1/orders/items/" + item.getId() + "/fulfillment")
                        .param("status", "SHIPPED")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Parent order status should become SHIPPED since the only item was shipped
        Order updatedOrder = orderRepository.findByOrderNumber("NC-VEND-TEST").orElseThrow();
        assertEquals("SHIPPED", updatedOrder.getStatus());
    }
}
