package com.nexacart.backend.modules.vendor.service;

import com.nexacart.backend.modules.vendor.dto.StoreResponse;
import com.nexacart.backend.modules.vendor.dto.StoreUpdateRequest;
import com.nexacart.backend.modules.vendor.dto.VendorRegisterRequest;
import com.nexacart.backend.modules.vendor.dto.VendorResponse;

import java.util.List;

public interface VendorService {
    
    VendorResponse applyToBeVendor(VendorRegisterRequest request, String userEmail);
    
    VendorResponse approveVendor(Long vendorId, boolean approved);
    
    List<VendorResponse> getVendorsByStatus(String status);
    
    StoreResponse getMyStore(String userEmail);
    
    StoreResponse updateMyStore(StoreUpdateRequest request, String userEmail);
    
    StoreResponse getStoreById(Long storeId);
}
