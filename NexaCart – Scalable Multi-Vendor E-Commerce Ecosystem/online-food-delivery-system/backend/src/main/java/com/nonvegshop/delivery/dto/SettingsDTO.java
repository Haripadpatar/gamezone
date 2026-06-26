package com.nonvegshop.delivery.dto;

public class SettingsDTO {
    private String shopName;
    private String shopAddress;
    private String shopLatLng;
    private String shopPhone;
    private String deliveryHours;
    private String deliveryFee0To3;
    private String deliveryFee3To6;
    private String deliveryFee6To10;
    private String googleMapsApiKey;

    public SettingsDTO() {}

    public String getGoogleMapsApiKey() {
        return googleMapsApiKey;
    }

    public void setGoogleMapsApiKey(String googleMapsApiKey) {
        this.googleMapsApiKey = googleMapsApiKey;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getShopAddress() {
        return shopAddress;
    }

    public void setShopAddress(String shopAddress) {
        this.shopAddress = shopAddress;
    }

    public String getShopLatLng() {
        return shopLatLng;
    }

    public void setShopLatLng(String shopLatLng) {
        this.shopLatLng = shopLatLng;
    }

    public String getShopPhone() {
        return shopPhone;
    }

    public void setShopPhone(String shopPhone) {
        this.shopPhone = shopPhone;
    }

    public String getDeliveryHours() {
        return deliveryHours;
    }

    public void setDeliveryHours(String deliveryHours) {
        this.deliveryHours = deliveryHours;
    }

    public String getDeliveryFee0To3() {
        return deliveryFee0To3;
    }

    public void setDeliveryFee0To3(String deliveryFee0To3) {
        this.deliveryFee0To3 = deliveryFee0To3;
    }

    public String getDeliveryFee3To6() {
        return deliveryFee3To6;
    }

    public void setDeliveryFee3To6(String deliveryFee3To6) {
        this.deliveryFee3To6 = deliveryFee3To6;
    }

    public String getDeliveryFee6To10() {
        return deliveryFee6To10;
    }

    public void setDeliveryFee6To10(String deliveryFee6To10) {
        this.deliveryFee6To10 = deliveryFee6To10;
    }
}
