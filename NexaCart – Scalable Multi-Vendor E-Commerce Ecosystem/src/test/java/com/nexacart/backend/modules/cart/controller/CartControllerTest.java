package com.nexacart.backend.modules.cart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexacart.backend.modules.cart.dto.CartItemRequest;
import com.nexacart.backend.modules.cart.repository.CartItemRepository;
import com.nexacart.backend.modules.cart.repository.CartRepository;
import com.nexacart.backend.modules.cart.repository.WishlistRepository;
import com.nexacart.backend.modules.product.model.Category;
import com.nexacart.backend.modules.product.model.Inventory;
import com.nexacart.backend.modules.product.model.Product;
import com.nexacart.backend.modules.product.model.ProductVariant;
import com.nexacart.backend.modules.product.repository.CategoryRepository;
import com.nexacart.backend.modules.product.repository.ProductRepository;
import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.model.Role;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.model.UserStatus;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public class CartControllerTest {

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
    private WishlistRepository wishlistRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User customerUser;
    private ProductVariant variant;
    private Product product;

    @BeforeEach
    public void setup() {
        wishlistRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        storeRepository.deleteAll();
        vendorRepository.deleteAll();
        userRepository.deleteAll();

        // Bootstrapping
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_CUSTOMER).build()));

        Role vendorRole = roleRepository.findByName(ERole.ROLE_VENDOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_VENDOR).build()));

        customerUser = User.builder()
                .email("buyer@example.com")
                .password("password")
                .firstName("John")
                .lastName("Buyer")
                .status(UserStatus.ACTIVE)
                .role(customerRole)
                .build();
        userRepository.save(customerUser);

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
                .taxId("TAX-SELLER")
                .build();
        vendorRepository.save(vendor);

        Store store = Store.builder()
                .vendor(vendor)
                .name("Seller Store")
                .build();
        storeRepository.save(store);

        Category category = Category.builder()
                .name("Electronics")
                .slug("electronics")
                .build();
        categoryRepository.save(category);

        product = Product.builder()
                .store(store)
                .category(category)
                .name("Smartphone")
                .slug("smartphone")
                .price(new BigDecimal("500.00"))
                .isApproved(true)
                .isActive(true)
                .build();
        productRepository.save(product);

        variant = ProductVariant.builder()
                .product(product)
                .sku("SMART-BLK-64")
                .size("64GB")
                .color("Black")
                .priceModifier(new BigDecimal("50.00")) // Actual variant price is 550.00
                .build();

        Inventory inventory = Inventory.builder()
                .productVariant(variant)
                .stockQuantity(10)
                .build();
        variant.setInventory(inventory);

        product.setVariants(new ArrayList<>(List.of(variant)));
        Product savedProduct = productRepository.save(product);
        variant = savedProduct.getVariants().get(0);
    }

    @Test
    @WithMockUser(username = "buyer@example.com", authorities = "ROLE_CUSTOMER")
    public void testCartOperationsFlow() throws Exception {
        // 1. Get empty cart
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalItems", is(0)))
                .andExpect(jsonPath("$.data.totalPrice").value(0));

        // 2. Add product variant to cart
        CartItemRequest addRequest = new CartItemRequest();
        addRequest.setProductVariantId(variant.getId());
        addRequest.setQuantity(2);

        mockMvc.perform(post("/api/v1/cart")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalItems", is(2)))
                .andExpect(jsonPath("$.data.totalPrice").value(1100.00))
                .andExpect(jsonPath("$.data.items[0].sku", is("SMART-BLK-64")));

        // 3. Update item quantity
        mockMvc.perform(put("/api/v1/cart/items/" + variant.getId())
                        .param("quantity", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalItems", is(5)))
                .andExpect(jsonPath("$.data.totalPrice").value(2750.00));

        // 4. Try adding quantity that exceeds stock limit (stock = 10, total would become 15)
        CartItemRequest exceedRequest = new CartItemRequest();
        exceedRequest.setProductVariantId(variant.getId());
        exceedRequest.setQuantity(10); // 5 already in cart, total would be 15 (exceeds stock 10)

        mockMvc.perform(post("/api/v1/cart")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exceedRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 5. Delete item from cart
        mockMvc.perform(delete("/api/v1/cart/items/" + variant.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalItems", is(0)));
    }

    @Test
    @WithMockUser(username = "buyer@example.com", authorities = "ROLE_CUSTOMER")
    public void testWishlistOperationsFlow() throws Exception {
        // 1. Add product to wishlist
        mockMvc.perform(post("/api/v1/wishlist/products/" + product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.productName", is("Smartphone")));

        assertTrue(wishlistRepository.existsByUserIdAndProductId(customerUser.getId(), product.getId()));

        // 2. Get my wishlist
        mockMvc.perform(get("/api/v1/wishlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].productName", is("Smartphone")));

        // 3. Remove product from wishlist
        mockMvc.perform(delete("/api/v1/wishlist/products/" + product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        assertFalse(wishlistRepository.existsByUserIdAndProductId(customerUser.getId(), product.getId()));
    }
}
