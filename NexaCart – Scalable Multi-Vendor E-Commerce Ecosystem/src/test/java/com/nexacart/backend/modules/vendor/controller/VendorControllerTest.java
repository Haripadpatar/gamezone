package com.nexacart.backend.modules.vendor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.model.Role;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.model.UserStatus;
import com.nexacart.backend.modules.user.repository.RoleRepository;
import com.nexacart.backend.modules.user.repository.UserRepository;
import com.nexacart.backend.modules.vendor.dto.StoreUpdateRequest;
import com.nexacart.backend.modules.vendor.dto.VendorRegisterRequest;
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

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public class VendorControllerTest {

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
    private com.nexacart.backend.modules.product.repository.ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testCustomer;

    @BeforeEach
    public void setup() {
        productRepository.deleteAll();
        storeRepository.deleteAll();
        vendorRepository.deleteAll();
        userRepository.deleteAll();

        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_CUSTOMER).build()));

        roleRepository.findByName(ERole.ROLE_VENDOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_VENDOR).build()));

        testCustomer = User.builder()
                .email("buyer@example.com")
                .password("password")
                .firstName("John")
                .lastName("Buyer")
                .status(UserStatus.ACTIVE)
                .role(customerRole)
                .build();
        userRepository.save(testCustomer);
    }

    @Test
    @WithMockUser(username = "buyer@example.com", authorities = "ROLE_CUSTOMER")
    public void testVendorLifecycleFlow() throws Exception {
        // 1. Customer applies to become a vendor
        VendorRegisterRequest registerRequest = new VendorRegisterRequest();
        registerRequest.setBusinessName("Global Goods Inc");
        registerRequest.setTaxId("TAX-998811");
        registerRequest.setBankDetails("IBAN US99000111222");

        mockMvc.perform(post("/api/v1/vendors/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.businessName", is("Global Goods Inc")))
                .andExpect(jsonPath("$.data.verificationStatus", is("PENDING")));

        // Fetch application from database
        Vendor vendor = vendorRepository.findByUserEmail("buyer@example.com")
                .orElseThrow(() -> new AssertionError("Vendor not saved"));
        assertEquals(VerificationStatus.PENDING, vendor.getVerificationStatus());

        // 2. Admin approves the vendor application
        mockMvc.perform(post("/api/v1/admin/vendors/" + vendor.getId() + "/approve")
                        .param("approved", "true")
                        .with(request -> {
                            // Override security to Admin
                            request.setRemoteUser("admin@example.com");
                            return request;
                        }))
                // Note: @WithMockUser is at test method level, we mock the admin call by using custom attributes or just changing authorities.
                // Let's test standard PreAuthorize check by calling it without ROLE_ADMIN (should fail with 403)
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", authorities = "ROLE_ADMIN")
    public void testAdminApprovalEndpointSuccess() throws Exception {
        // Prepare pre-existing application
        Vendor vendor = Vendor.builder()
                .user(testCustomer)
                .businessName("Admin Approved Business")
                .taxId("TAX-112233")
                .bankDetails("Bank Details info")
                .verificationStatus(VerificationStatus.PENDING)
                .build();
        vendorRepository.save(vendor);

        // Call Admin approve
        mockMvc.perform(post("/api/v1/admin/vendors/" + vendor.getId() + "/approve")
                        .param("approved", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.verificationStatus", is("APPROVED")));

        // Verify promotion
        User updatedUser = userRepository.findById(testCustomer.getId()).orElseThrow();
        assertEquals(ERole.ROLE_VENDOR, updatedUser.getRole().getName());

        // Verify storefront initialization
        assertTrue(storeRepository.findByVendorId(vendor.getId()).isPresent());
    }

    @Test
    @WithMockUser(username = "buyer@example.com", authorities = "ROLE_VENDOR")
    public void testStoreManagementOperations() throws Exception {
        // Setup approved vendor and store
        Vendor vendor = Vendor.builder()
                .user(testCustomer)
                .businessName("My Store Vendor")
                .taxId("TAX-444")
                .bankDetails("Details")
                .verificationStatus(VerificationStatus.APPROVED)
                .build();
        vendorRepository.save(vendor);

        com.nexacart.backend.modules.vendor.model.Store store = com.nexacart.backend.modules.vendor.model.Store.builder()
                .vendor(vendor)
                .name("Old Store Name")
                .description("Old Desc")
                .build();
        storeRepository.save(store);

        // Fetch My Store
        mockMvc.perform(get("/api/v1/vendors/my-store"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Old Store Name")));

        // Update Store
        StoreUpdateRequest updateRequest = new StoreUpdateRequest();
        updateRequest.setName("New Store Name");
        updateRequest.setDescription("New Store Description");
        updateRequest.setLogoUrl("http://logo.com/image.png");
        updateRequest.setBannerUrl("http://banner.com/banner.png");

        mockMvc.perform(put("/api/v1/vendors/my-store")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("New Store Name")))
                .andExpect(jsonPath("$.data.description", is("New Store Description")))
                .andExpect(jsonPath("$.data.logoUrl", is("http://logo.com/image.png")))
                .andExpect(jsonPath("$.data.bannerUrl", is("http://banner.com/banner.png")));
    }
}
