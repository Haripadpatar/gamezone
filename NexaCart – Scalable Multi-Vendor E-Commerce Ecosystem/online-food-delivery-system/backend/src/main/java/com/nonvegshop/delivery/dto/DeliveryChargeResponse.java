package com.nonvegshop.delivery.dto;

import java.math.BigDecimal;

public class DeliveryChargeResponse {
    private double distanceKm;
    private BigDecimal deliveryCharge;
    private boolean deliverable;
    private String formattedAddress;
    private Double latitude;
    private Double longitude;

    public DeliveryChargeResponse() {}

    public DeliveryChargeResponse(double distanceKm, BigDecimal deliveryCharge, boolean deliverable, String formattedAddress) {
        this.distanceKm = distanceKm;
        this.deliveryCharge = deliveryCharge;
        this.deliverable = deliverable;
        this.formattedAddress = formattedAddress;
    }

    public DeliveryChargeResponse(double distanceKm, BigDecimal deliveryCharge, boolean deliverable, String formattedAddress, Double latitude, Double longitude) {
        this.distanceKm = distanceKm;
        this.deliveryCharge = deliveryCharge;
        this.deliverable = deliverable;
        this.formattedAddress = formattedAddress;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public BigDecimal getDeliveryCharge() {
        return deliveryCharge;
    }

    public void setDeliveryCharge(BigDecimal deliveryCharge) {
        this.deliveryCharge = deliveryCharge;
    }

    public boolean isDeliverable() {
        return deliverable;
    }

    public void setDeliverable(boolean deliverable) {
        this.deliverable = deliverable;
    }

    public String getFormattedAddress() {
        return formattedAddress;
    }

    public void setFormattedAddress(String formattedAddress) {
        this.formattedAddress = formattedAddress;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
