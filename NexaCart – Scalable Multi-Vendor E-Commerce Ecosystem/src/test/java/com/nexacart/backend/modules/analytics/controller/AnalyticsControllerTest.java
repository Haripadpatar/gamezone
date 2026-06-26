package com.nexacart.backend.modules.analytics.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexacart.backend.modules.order.model.Order;
import com.nexacart.backend.modules.order.model.OrderItem;
import com.nexacart.backend.modules.order.repository.OrderItemRepository;
import com.nexacart.backend.modules.order.repository.OrderRepository;
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
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CacheManager cacheManager;

    private User vendorUser;
    private Store store;
    private Order order;

    @BeforeEach
    public void setup() {
        // Clear caches
        cacheManager.getCacheNames().forEach(name -> cacheManager.getCache(name).clear());

        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_CUSTOMER).build()));
        Role vendorRole = roleRepository.findByName(ERole.ROLE_VENDOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_VENDOR).build()));
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).build()));

        User customerUser = User.builder()
                .email("buyer@example.com")
                .password("password")
                .firstName("Buyer")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .role(customerRole)
                .build();
        userRepository.save(customerUser);

        Address shippingAddress = Address.builder()
                .user(customerUser)
                .street("123 Main St")
                .city("New York")
                .state("NY")
                .zipCode("10001")
                .country("USA")
                .build();
        addressRepository.save(shippingAddress);

        vendorUser = User.builder()
                .email("seller@example.com")
                .password("password")
                .firstName("Seller")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .role(vendorRole)
                .build();
        userRepository.save(vendorUser);

        Vendor vendor = Vendor.builder()
                .user(vendorUser)
                .businessName("Seller Inc")
                .taxId("TAX-1234")
                .build();
        vendorRepository.save(vendor);

        store = Store.builder()
                .vendor(vendor)
                .name("Seller Store")
                .commissionRate(new BigDecimal("10.00"))
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

        ProductVariant variant = ProductVariant.builder()
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

        // Save a PAID order to show in analytics
        order = Order.builder()
                .user(customerUser)
                .shippingAddress(shippingAddress)
                .totalAmount(new BigDecimal("300.00"))
                .platformCommission(new BigDecimal("30.00"))
                .status("PAID")
                .orderNumber("NC-ANALYTICS-TEST")
                .build();

        OrderItem item = OrderItem.builder()
                .order(order)
                .productVariant(variant)
                .store(store)
                .quantity(3)
                .price(new BigDecimal("100.00"))
                .fulfillmentStatus("PENDING")
                .build();
        order.setOrderItems(new ArrayList<>(List.of(item)));
        orderRepository.save(order);
    }

    @Test
    @WithMockUser(username = "seller@example.com", authorities = "ROLE_VENDOR")
    public void testVendorAnalyticsFlowAndCaching() throws Exception {
        // Verify cache is empty initially
        assertNull(cacheManager.getCache("vendor_analytics").get("seller@example.com"));

        // 1. Get vendor analytics
        mockMvc.perform(get("/api/v1/vendor/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalEarnings").value(300.00))
                .andExpect(jsonPath("$.data.totalOrders", is(1)))
                .andExpect(jsonPath("$.data.totalProductsSold", is(3)));

        // Verify cache is populated after request
        assertNotNull(cacheManager.getCache("vendor_analytics").get("seller@example.com"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = "ROLE_ADMIN")
    public void testAdminAnalyticsFlowAndCaching() throws Exception {
        // Verify cache is empty initially
        assertNull(cacheManager.getCache("admin_analytics").get("dashboard"));

        // 1. Get admin analytics
        mockMvc.perform(get("/api/v1/admin/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalPlatformRevenue").value(300.00))
                .andExpect(jsonPath("$.data.totalCommissionEarned").value(30.00))
                .andExpect(jsonPath("$.data.totalOrders", is(1)));

        // Verify cache is populated after request
        assertNotNull(cacheManager.getCache("admin_analytics").get("dashboard"));
    }
}
