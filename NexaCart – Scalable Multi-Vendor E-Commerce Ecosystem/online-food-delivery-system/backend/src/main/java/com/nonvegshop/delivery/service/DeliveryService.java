package com.nonvegshop.delivery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nonvegshop.delivery.dto.DeliveryChargeResponse;
import com.nonvegshop.delivery.entity.ShopSetting;
import com.nonvegshop.delivery.exception.BadRequestException;
import com.nonvegshop.delivery.repository.ShopSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class DeliveryService {
    private static final Logger logger = LoggerFactory.getLogger(DeliveryService.class);

    @Value("${google.maps.api-key:}")
    private String googleApiKey;

    @Autowired
    private ShopSettingRepository shopSettingRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DeliveryChargeResponse calculateDelivery(String customerAddress) {
        return calculateDelivery(customerAddress, null, null);
    }

    public DeliveryChargeResponse calculateDelivery(String customerAddress, Double latitude, Double longitude) {
        // 1. Get Shop coordinates and details
        String shopLatLng = getSetting("shop_lat_lng", "12.9716,77.5946");
        
        double distanceKm = 0.0;
        String formattedAddress = customerAddress;
        Double responseLat = latitude;
        Double responseLng = longitude;

        // Determine if we should calculate based on coordinates
        boolean hasCoords = latitude != null && longitude != null;

        if (hasCoords) {
            // Calculate by Coordinates
            if (googleApiKey != null && !googleApiKey.trim().isEmpty()) {
                try {
                    // 1. Reverse Geocode lat,lng to address string
                    formattedAddress = reverseGeocode(latitude, longitude);
                    // 2. Fetch driving distance via Google Maps Distance Matrix
                    distanceKm = fetchDistanceViaGoogleMapsLatLng(shopLatLng, latitude, longitude);
                    logger.info("Fetched coordinates distance from Google Maps: {} km for lat: {}, lng: {}", distanceKm, latitude, longitude);
                } catch (Exception e) {
                    logger.error("Google Maps API failed for coordinates, falling back to mock calculation: {}", e.getMessage());
                    distanceKm = calculateMockDistanceCoords(shopLatLng, latitude, longitude);
                    formattedAddress = "Mock Location near Lat: " + String.format("%.4f", latitude) + ", Lng: " + String.format("%.4f", longitude) + ", Bengaluru";
                }
            } else {
                // Mock Fallback for coords
                distanceKm = calculateMockDistanceCoords(shopLatLng, latitude, longitude);
                formattedAddress = "Mock Location near Lat: " + String.format("%.4f", latitude) + ", Lng: " + String.format("%.4f", longitude) + ", Bengaluru";
                logger.info("Google Maps API Key missing. Using mock coordinates distance: {} km", distanceKm);
            }
        } else {
            // Calculate by text address (original way)
            if (customerAddress == null || customerAddress.trim().isEmpty()) {
                throw new BadRequestException("Address cannot be empty");
            }
            if (googleApiKey != null && !googleApiKey.trim().isEmpty()) {
                try {
                    double[] coords = geocodeAddress(customerAddress);
                    responseLat = coords[0];
                    responseLng = coords[1];
                    distanceKm = fetchDistanceViaGoogleMapsLatLng(shopLatLng, responseLat, responseLng);
                    formattedAddress = customerAddress;
                } catch (Exception e) {
                    logger.error("Google Maps API failed for address, falling back to mock calculation: {}", e.getMessage());
                    distanceKm = calculateMockDistance(customerAddress);
                }
            } else {
                distanceKm = calculateMockDistance(customerAddress);
            }
        }

        // Apply delivery fee rules
        BigDecimal deliveryCharge = getDeliveryFeeForDistance(distanceKm);
        boolean deliverable = distanceKm <= 10.0;

        return new DeliveryChargeResponse(
                Math.round(distanceKm * 100.0) / 100.0, // Round to 2 decimal places
                deliveryCharge,
                deliverable,
                formattedAddress,
                responseLat,
                responseLng
        );
    }

    private String reverseGeocode(Double lat, Double lng) throws Exception {
        String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("latlng", lat + "," + lng)
                .queryParam("key", googleApiKey)
                .toUriString();

        String response = restTemplate.getForObject(url, String.class);
        JsonNode json = objectMapper.readTree(response);

        if (!"OK".equals(json.path("status").asText())) {
            throw new RuntimeException("Reverse geocoding failed with status: " + json.path("status").asText());
        }

        return json.path("results").get(0).path("formatted_address").asText();
    }

    private double[] geocodeAddress(String address) throws Exception {
        String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("address", address)
                .queryParam("key", googleApiKey)
                .toUriString();

        String response = restTemplate.getForObject(url, String.class);
        JsonNode json = objectMapper.readTree(response);

        if (!"OK".equals(json.path("status").asText())) {
            throw new RuntimeException("Geocoding failed with status: " + json.path("status").asText());
        }

        JsonNode locationNode = json.path("results").get(0).path("geometry").path("location");
        double lat = locationNode.path("lat").asDouble();
        double lng = locationNode.path("lng").asDouble();
        return new double[]{lat, lng};
    }

    private double fetchDistanceViaGoogleMapsLatLng(String originLatLng, Double destLat, Double destLng) throws Exception {
        String distanceUrl = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/distancematrix/json")
                .queryParam("origins", originLatLng)
                .queryParam("destinations", destLat + "," + destLng)
                .queryParam("mode", "driving")
                .queryParam("key", googleApiKey)
                .toUriString();

        String distanceResponse = restTemplate.getForObject(distanceUrl, String.class);
        JsonNode distanceJson = objectMapper.readTree(distanceResponse);

        if (!"OK".equals(distanceJson.path("status").asText())) {
            throw new RuntimeException("Distance Matrix failed with status: " + distanceJson.path("status").asText());
        }

        JsonNode elementNode = distanceJson.path("rows").get(0).path("elements").get(0);
        if (!"OK".equals(elementNode.path("status").asText())) {
            throw new RuntimeException("Distance Element failed with status: " + elementNode.path("status").asText());
        }

        double distanceMeters = elementNode.path("distance").path("value").asDouble();
        return distanceMeters / 1000.0;
    }

    private double calculateMockDistanceCoords(String shopLatLng, Double customerLat, Double customerLng) {
        try {
            String[] parts = shopLatLng.split(",");
            double shopLat = Double.parseDouble(parts[0].trim());
            double shopLng = Double.parseDouble(parts[1].trim());

            double earthRadius = 6371.0; // km
            double dLat = Math.toRadians(customerLat - shopLat);
            double dLng = Math.toRadians(customerLng - shopLng);
            double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                       Math.cos(Math.toRadians(shopLat)) * Math.cos(Math.toRadians(customerLat)) *
                       Math.sin(dLng / 2.0) * Math.sin(dLng / 2.0);
            double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
            double straightDistance = earthRadius * c;

            // Apply winding road factor
            return straightDistance * 1.25;
        } catch (Exception e) {
            return 2.5; // fallback default
        }
    }

    private double calculateMockDistance(String address) {
        String cleanAddress = address.trim().toLowerCase();

        // 1. Explicit mock addresses for developer testing
        if (cleanAddress.contains("close") || cleanAddress.contains("nearby") || cleanAddress.contains("1km")) {
            return 1.2;
        } else if (cleanAddress.contains("medium") || cleanAddress.contains("5km")) {
            return 4.5;
        } else if (cleanAddress.contains("far") || cleanAddress.contains("8km")) {
            return 7.8;
        } else if (cleanAddress.contains("out of city") || cleanAddress.contains("remote") || cleanAddress.contains("15km")) {
            return 14.5;
        }

        // 2. Deterministic hash-based distance (ensures same address gives same distance)
        int hash = Math.abs(address.hashCode());
        // Distances from 0.5 km to 12.5 km
        return 0.5 + (hash % 120) / 10.0;
    }

    public BigDecimal getDeliveryFeeForDistance(double distanceKm) {
        if (distanceKm > 10.0) {
            throw new BadRequestException("We only deliver within 10 km of our shop location. Current distance is " + String.format("%.2f", distanceKm) + " km.");
        }

        if (distanceKm <= 3.0) {
            return new BigDecimal(getSetting("delivery_fee_0_3", "50"));
        } else if (distanceKm <= 6.0) {
            return new BigDecimal(getSetting("delivery_fee_3_6", "80"));
        } else {
            return new BigDecimal(getSetting("delivery_fee_6_10", "120"));
        }
    }

    private String getSetting(String key, String defaultValue) {
        return shopSettingRepository.findById(key)
                .map(ShopSetting::getValue)
                .orElse(defaultValue);
    }
}
