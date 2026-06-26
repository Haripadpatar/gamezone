package com.nexacart.backend.modules.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexacart.backend.modules.product.dto.ProductCreateRequest;
import com.nexacart.backend.modules.product.dto.ProductImageDto;
import com.nexacart.backend.modules.product.dto.ProductVariantDto;
import com.nexacart.backend.modules.product.model.Category;
import com.nexacart.backend.modules.product.model.Product;
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
import com.nexacart.backend.modules.vendor.model.VerificationStatus;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public class ProductControllerTest {

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
    private ObjectMapper objectMapper;

    private User vendorUser;
    private Store vendorStore;
    private Category apparelCategory;

    @BeforeEach
    public void setup() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        storeRepository.deleteAll();
        vendorRepository.deleteAll();
        userRepository.deleteAll();

        // Seed Roles
        Role vendorRole = roleRepository.findByName(ERole.ROLE_VENDOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_VENDOR).build()));

        roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).build()));

        // Seed Vendor User, Vendor Entity, and Store
        vendorUser = User.builder()
                .email("vendor@example.com")
                .password("password")
                .firstName("Alice")
                .lastName("Vendor")
                .status(UserStatus.ACTIVE)
                .role(vendorRole)
                .build();
        userRepository.save(vendorUser);

        Vendor vendor = Vendor.builder()
                .user(vendorUser)
                .businessName("Alice Apparels")
                .taxId("TAX-8888")
                .verificationStatus(VerificationStatus.APPROVED)
                .build();
        vendorRepository.save(vendor);

        vendorStore = Store.builder()
                .vendor(vendor)
                .name("Alice Store")
                .description("Boutique store")
                .commissionRate(new BigDecimal("10.00"))
                .build();
        storeRepository.save(vendorStore);

        // Seed Category
        apparelCategory = Category.builder()
                .name("Apparel")
                .slug("apparel")
                .build();
        categoryRepository.save(apparelCategory);
    }

    @Test
    @WithMockUser(username = "vendor@example.com", authorities = "ROLE_VENDOR")
    public void testProductLifecycleAndFilters() throws Exception {
        // 1. Vendor uploads a new product
        ProductCreateRequest createRequest = new ProductCreateRequest();
        createRequest.setCategorySlug("apparel");
        createRequest.setName("Classic Blue Jeans");
        createRequest.setDescription("Premium quality denim jeans");
        createRequest.setPrice(new BigDecimal("49.99"));

        ProductImageDto imgDto = new ProductImageDto();
        imgDto.setUrl("http://images.com/jeans.png");
        imgDto.setPrimary(true);
        createRequest.setImages(List.of(imgDto));

        ProductVariantDto varDto = new ProductVariantDto();
        varDto.setSku("JEANS-BLU-M");
        varDto.setSize("M");
        varDto.setColor("Blue");
        varDto.setPriceModifier(new BigDecimal("0.00"));
        varDto.setStockQuantity(50);
        varDto.setLowStockThreshold(5);
        createRequest.setVariants(List.of(varDto));

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Classic Blue Jeans")))
                .andExpect(jsonPath("$.data.approved", is(false)))
                .andExpect(jsonPath("$.data.variants", hasSize(1)));

        // Retrieve from database
        Product product = productRepository.findBySlug("classic-blue-jeans")
                .orElseThrow(() -> new AssertionError("Product not saved"));
        assertEquals("Classic Blue Jeans", product.getName());

        // 2. Search should NOT return this product since it is NOT approved yet
        mockMvc.perform(get("/api/v1/products")
                        .param("keyword", "Jeans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));

        // 3. Admin approves the product
        mockMvc.perform(post("/api/v1/admin/products/" + product.getId() + "/approve")
                        .param("approved", "true")
                        .with(request -> {
                            request.setRemoteUser("admin@example.com");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON))
                // Fails because the active WithMockUser is ROLE_VENDOR.
                // We will test Admin approval inside another test case with admin auth.
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = "ROLE_ADMIN")
    public void testAdminProductApprovalSuccess() throws Exception {
        // Pre-create unapproved product
        Product product = Product.builder()
                .store(vendorStore)
                .category(apparelCategory)
                .name("Unapproved Shirt")
                .slug("unapproved-shirt")
                .price(new BigDecimal("29.99"))
                .isApproved(false)
                .isActive(true)
                .build();
        productRepository.save(product);

        // Approve it
        mockMvc.perform(post("/api/v1/admin/products/" + product.getId() + "/approve")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.approved", is(true)));

        Product approvedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertTrue(approvedProduct.isApproved());
    }

    @Test
    public void testProductSearchAndFiltering() throws Exception {
        // Setup approved product with variants
        Product product = Product.builder()
                .store(vendorStore)
                .category(apparelCategory)
                .name("Summer T-Shirt")
                .slug("summer-t-shirt")
                .price(new BigDecimal("19.99"))
                .isApproved(true)
                .isActive(true)
                .build();

        com.nexacart.backend.modules.product.model.ProductVariant variant =
                com.nexacart.backend.modules.product.model.ProductVariant.builder()
                        .product(product)
                        .sku("TSHIRT-RED-L")
                        .size("L")
                        .color("Red")
                        .priceModifier(new BigDecimal("2.00"))
                        .build();

        product.setVariants(new ArrayList<>(List.of(variant)));
        productRepository.save(product);

        // Search by keyword and size (should find it)
        mockMvc.perform(get("/api/v1/products")
                        .param("keyword", "T-Shirt")
                        .param("size", "L")
                        .param("color", "Red"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].name", is("Summer T-Shirt")));

        // Search with wrong size (should NOT find it)
        mockMvc.perform(get("/api/v1/products")
                        .param("keyword", "T-Shirt")
                        .param("size", "XL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }
}
