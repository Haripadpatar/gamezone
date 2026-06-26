package com.nonvegshop.delivery.service;

import com.nonvegshop.delivery.dto.ProductDTO;
import com.nonvegshop.delivery.entity.Category;
import com.nonvegshop.delivery.entity.Product;
import com.nonvegshop.delivery.entity.ProductImage;
import com.nonvegshop.delivery.exception.ResourceNotFoundException;
import com.nonvegshop.delivery.repository.CategoryRepository;
import com.nonvegshop.delivery.repository.ProductRepository;
import com.nonvegshop.delivery.entity.Restaurant;
import com.nonvegshop.delivery.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String query, Long categoryId) {
        if (query == null) query = "";
        query = query.trim();

        if (categoryId != null) {
            return productRepository.searchProductsByCategory(categoryId, query);
        } else {
            return productRepository.searchProducts(query);
        }
    }

    public List<Product> getProductsByRestaurant(Long restaurantId) {
        return productRepository.findByRestaurantId(restaurantId);
    }

    @Transactional
    public Product createProduct(ProductDTO productDTO, Long restaurantId) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));

        Product product = new Product();
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStock(productDTO.getStock());
        product.setCategory(category);

        if (restaurantId != null) {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            product.setRestaurant(restaurant);
        } else {
            Restaurant defaultRestaurant = restaurantRepository.findFirstByOrderByIdAsc().orElse(null);
            product.setRestaurant(defaultRestaurant);
        }

        if (productDTO.getImageUrls() != null && !productDTO.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (String url : productDTO.getImageUrls()) {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setImageUrl(url);
                images.add(img);
            }
            product.setImages(images);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductDTO productDTO, Long restaurantId) {
        Product product = getProductById(id);
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStock(productDTO.getStock());
        product.setCategory(category);

        if (restaurantId != null) {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            product.setRestaurant(restaurant);
        }

        // Update images: clear previous, add new ones
        product.getImages().clear();
        if (productDTO.getImageUrls() != null && !productDTO.getImageUrls().isEmpty()) {
            for (String url : productDTO.getImageUrls()) {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setImageUrl(url);
                product.getImages().add(img);
            }
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
