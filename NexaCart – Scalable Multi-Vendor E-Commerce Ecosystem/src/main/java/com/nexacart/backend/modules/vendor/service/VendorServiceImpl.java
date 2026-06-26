package com.nexacart.backend.modules.vendor.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.model.Role;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.repository.RoleRepository;
import com.nexacart.backend.modules.user.repository.UserRepository;
import com.nexacart.backend.modules.vendor.dto.StoreResponse;
import com.nexacart.backend.modules.vendor.dto.StoreUpdateRequest;
import com.nexacart.backend.modules.vendor.dto.VendorRegisterRequest;
import com.nexacart.backend.modules.vendor.dto.VendorResponse;
import com.nexacart.backend.modules.vendor.model.Store;
import com.nexacart.backend.modules.vendor.model.Vendor;
import com.nexacart.backend.modules.vendor.model.VerificationStatus;
import com.nexacart.backend.modules.vendor.repository.StoreRepository;
import com.nexacart.backend.modules.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VendorRepository vendorRepository;
    private final StoreRepository storeRepository;

    @Override
    @Transactional
    public VendorResponse applyToBeVendor(VendorRegisterRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (vendorRepository.findByUserId(user.getId()).isPresent()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You have already applied or are already a vendor");
        }

        Vendor vendor = Vendor.builder()
                .user(user)
                .businessName(request.getBusinessName())
                .taxId(request.getTaxId())
                .bankDetails(request.getBankDetails())
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        Vendor savedVendor = vendorRepository.save(vendor);
        log.info("Vendor application submitted by: {}", userEmail);
        return mapToVendorResponse(savedVendor);
    }

    @Override
    @Transactional
    public VendorResponse approveVendor(Long vendorId, boolean approved) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Vendor application not found"));

        if (vendor.getVerificationStatus() != VerificationStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vendor application has already been processed");
        }

        if (approved) {
            vendor.setVerificationStatus(VerificationStatus.APPROVED);
            
            // 1. Promote User Role to VENDOR
            User user = vendor.getUser();
            Role vendorRole = roleRepository.findByName(ERole.ROLE_VENDOR)
                    .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Vendor role not initialized"));
            user.setRole(vendorRole);
            userRepository.save(user);

            // 2. Initialize Default Store
            String storeName = vendor.getBusinessName();
            if (storeRepository.existsByName(storeName)) {
                storeName = storeName + " (" + vendor.getId() + ")";
            }

            Store store = Store.builder()
                    .vendor(vendor)
                    .name(storeName)
                    .description("Welcome to " + storeName)
                    .commissionRate(new BigDecimal("10.00"))
                    .build();
            storeRepository.save(store);
            log.info("Vendor approved and store created: {}", storeName);
        } else {
            vendor.setVerificationStatus(VerificationStatus.REJECTED);
            log.info("Vendor application rejected for ID: {}", vendorId);
        }

        Vendor updatedVendor = vendorRepository.save(vendor);
        return mapToVendorResponse(updatedVendor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> getVendorsByStatus(String status) {
        List<Vendor> vendors;
        if ("ALL".equalsIgnoreCase(status)) {
            vendors = vendorRepository.findAll();
        } else {
            try {
                VerificationStatus verificationStatus = VerificationStatus.valueOf(status.toUpperCase());
                vendors = vendorRepository.findByVerificationStatus(verificationStatus);
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status filter: " + status);
            }
        }
        return vendors.stream().map(this::mapToVendorResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StoreResponse getMyStore(String userEmail) {
        Store store = storeRepository.findByVendorUserEmail(userEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Store not found for this account"));
        return mapToStoreResponse(store);
    }

    @Override
    @Transactional
    public StoreResponse updateMyStore(StoreUpdateRequest request, String userEmail) {
        Store store = storeRepository.findByVendorUserEmail(userEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Store not found for this account"));

        if (!store.getName().equalsIgnoreCase(request.getName()) && storeRepository.existsByName(request.getName())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Store name is already taken");
        }

        store.setName(request.getName());
        store.setDescription(request.getDescription());
        store.setLogoUrl(request.getLogoUrl());
        store.setBannerUrl(request.getBannerUrl());

        Store updatedStore = storeRepository.save(store);
        log.info("Store updated: {}", updatedStore.getName());
        return mapToStoreResponse(updatedStore);
    }

    @Override
    @Transactional(readOnly = true)
    public StoreResponse getStoreById(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Store not found"));
        return mapToStoreResponse(store);
    }

    private VendorResponse mapToVendorResponse(Vendor vendor) {
        return VendorResponse.builder()
                .id(vendor.getId())
                .userId(vendor.getUser().getId())
                .email(vendor.getUser().getEmail())
                .businessName(vendor.getBusinessName())
                .taxId(vendor.getTaxId())
                .verificationStatus(vendor.getVerificationStatus())
                .bankDetails(vendor.getBankDetails())
                .createdAt(vendor.getCreatedAt())
                .build();
    }

    private StoreResponse mapToStoreResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .vendorId(store.getVendor().getId())
                .vendorBusinessName(store.getVendor().getBusinessName())
                .name(store.getName())
                .description(store.getDescription())
                .logoUrl(store.getLogoUrl())
                .bannerUrl(store.getBannerUrl())
                .commissionRate(store.getCommissionRate())
                .build();
    }
}
