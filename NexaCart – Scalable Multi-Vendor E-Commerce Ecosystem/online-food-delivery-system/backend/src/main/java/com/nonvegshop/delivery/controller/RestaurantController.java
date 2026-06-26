package com.nonvegshop.delivery.controller;

import com.nonvegshop.delivery.entity.Restaurant;
import com.nonvegshop.delivery.entity.User;
import com.nonvegshop.delivery.repository.RestaurantRepository;
import com.nonvegshop.delivery.repository.UserRepository;
import com.nonvegshop.delivery.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class RestaurantController {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    // Public endpoints
    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return ResponseEntity.ok(restaurant);
    }

    @GetMapping("/restaurants/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam(value = "query", required = false) String query) {
        if (query == null) query = "";
        String finalQuery = query.toLowerCase().trim();
        List<Restaurant> results = restaurantRepository.findAll().stream()
                .filter(r -> r.getName().toLowerCase().contains(finalQuery) 
                          || (r.getCuisineType() != null && r.getCuisineType().toLowerCase().contains(finalQuery)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    // Admin endpoints
    @GetMapping("/admin/restaurants")
    public ResponseEntity<List<Restaurant>> getAdminRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @PostMapping("/admin/restaurants")
    public ResponseEntity<Restaurant> createRestaurant(@Valid @RequestBody Restaurant restaurant) {
        if (restaurant.getIsOpen() == null) {
            restaurant.setIsOpen(true);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantRepository.save(restaurant));
    }

    @PutMapping("/admin/restaurants/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody Restaurant restaurantDetails) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        
        restaurant.setName(restaurantDetails.getName());
        restaurant.setAddress(restaurantDetails.getAddress());
        restaurant.setPhone(restaurantDetails.getPhone());
        restaurant.setLatitude(restaurantDetails.getLatitude());
        restaurant.setLongitude(restaurantDetails.getLongitude());
        restaurant.setLogo(restaurantDetails.getLogo());
        restaurant.setBanner(restaurantDetails.getBanner());
        restaurant.setRating(restaurantDetails.getRating());
        restaurant.setCuisineType(restaurantDetails.getCuisineType());
        restaurant.setIsOpen(restaurantDetails.getIsOpen());

        return ResponseEntity.ok(restaurantRepository.save(restaurant));
    }

    @DeleteMapping("/admin/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        restaurantRepository.delete(restaurant);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/merchants")
    public ResponseEntity<List<User>> getAllMerchants() {
        return ResponseEntity.ok(userRepository.findByRole("MERCHANT"));
    }
}
