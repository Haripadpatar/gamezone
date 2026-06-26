package com.nonvegshop.delivery;

import com.nonvegshop.delivery.entity.User;
import com.nonvegshop.delivery.entity.Category;
import com.nonvegshop.delivery.entity.Product;
import com.nonvegshop.delivery.entity.ProductImage;
import com.nonvegshop.delivery.entity.Restaurant;
import com.nonvegshop.delivery.entity.Order;
import com.nonvegshop.delivery.repository.UserRepository;
import com.nonvegshop.delivery.repository.CategoryRepository;
import com.nonvegshop.delivery.repository.ProductRepository;
import com.nonvegshop.delivery.repository.RestaurantRepository;
import com.nonvegshop.delivery.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.math.BigDecimal;

@SpringBootApplication
@EnableScheduling
public class DeliveryApplication {

    @Autowired
    private RestaurantRepository restaurantRepository;

    public static void main(String[] args) {
        SpringApplication.run(DeliveryApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            RestaurantRepository restaurantRepository,
            OrderRepository orderRepository) {
        return args -> {
            // 1. Check if any admin exists. If not, create a default one.
            if (userRepository.findByPhone("9999999999").isEmpty()) {
                User admin = new User();
                admin.setName("Admin User");
                admin.setPhone("9999999999");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("Default admin user created: Phone: 9999999999, Password: admin123");
            }

            // Seed 6 Restaurants
            Restaurant r1 = restaurantRepository.findByName("Lutumari Fast Food")
                    .orElseGet(() -> restaurantRepository.save(new Restaurant(null, "Lutumari Fast Food", "Nagaon Bypass, Nagaon, Assam", "+919876543210", 26.3478, 92.6841, 
                            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80", 
                            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80", 
                            4.6, "Fast Food", true)));

            Restaurant r2 = restaurantRepository.findByName("Nagaon Spicy Kitchen")
                    .orElseGet(() -> restaurantRepository.save(new Restaurant(null, "Nagaon Spicy Kitchen", "Haibargaon, Nagaon, Assam", "+919876543211", 26.3552, 92.6715, 
                            "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=200&auto=format&fit=crop&q=80", 
                            "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80", 
                            4.8, "Biryani & Chicken", true)));

            Restaurant r3 = restaurantRepository.findByName("Abar Taste Kora")
                    .orElseGet(() -> restaurantRepository.save(new Restaurant(null, "Abar Taste Kora", "Amolapatty, Nagaon, Assam", "+919876543212", 26.3421, 92.6953, 
                            "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&auto=format&fit=crop&q=80", 
                            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80", 
                            4.5, "North Indian & Chinese", true)));

            Restaurant r4 = restaurantRepository.findByName("Biryani Express Nagaon")
                    .orElseGet(() -> restaurantRepository.save(new Restaurant(null, "Biryani Express Nagaon", "Christianpatty, Nagaon, Assam", "+919876543213", 26.3490, 92.6800, 
                            "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&auto=format&fit=crop&q=80", 
                            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80", 
                            4.4, "Biryani", true)));

            Restaurant r5 = restaurantRepository.findByName("Chowmein Hub")
                    .orElseGet(() -> restaurantRepository.save(new Restaurant(null, "Chowmein Hub", "Sensowa, Nagaon, Assam", "+919876543214", 26.3610, 92.6620, 
                            "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=200&auto=format&fit=crop&q=80", 
                            "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop&q=80", 
                            4.2, "Chowmein & Fast Food", true)));

            Restaurant r6 = restaurantRepository.findByName("Fish Corner")
                    .orElseGet(() -> restaurantRepository.save(new Restaurant(null, "Fish Corner", "Itachali, Nagaon, Assam", "+919876543215", 26.3410, 92.6900, 
                            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&auto=format&fit=crop&q=80", 
                            "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&auto=format&fit=crop&q=80", 
                            4.7, "Assamese & Fish", true)));

            // Seed a Default Merchant (linked to Lutumari Fast Food)
            if (userRepository.findByPhone("8888888888").isEmpty()) {
                User merchant = new User();
                merchant.setName("Merchant Owner");
                merchant.setPhone("8888888888");
                merchant.setPassword(passwordEncoder.encode("password"));
                merchant.setRole("MERCHANT");
                merchant.setRestaurant(r1);
                userRepository.save(merchant);
                System.out.println("Default merchant user created: Phone: 8888888888, Password: password");
            }

            // Link existing products/orders to default restaurant if they don't have one
            productRepository.findAll().forEach(p -> {
                if (p.getRestaurant() == null) {
                    p.setRestaurant(r1);
                    productRepository.save(p);
                }
            });

            orderRepository.findAll().forEach(o -> {
                if (o.getRestaurant() == null) {
                    o.setRestaurant(r1);
                    orderRepository.save(o);
                }
            });

            // 2. Perform seeding/refresh of products
            long currentProductCount = productRepository.count();
            boolean hasOldLocalUrls = false;
            if (currentProductCount == 21) {
                hasOldLocalUrls = productRepository.findAll().stream()
                        .anyMatch(p -> !p.getImages().isEmpty() && p.getImages().get(0).getImageUrl().startsWith("/products/"));
            }

            if (currentProductCount != 21 || hasOldLocalUrls) {
                System.out.println("Cleaning and seeding default catalog with high-quality Unsplash image fallbacks...");
                
                productRepository.deleteAll();
                
                Category chickenCat = categoryRepository.findByName("Chicken")
                        .orElseGet(() -> categoryRepository.save(new Category(null, "Chicken")));
                Category eggCat = categoryRepository.findByName("Egg")
                        .orElseGet(() -> categoryRepository.save(new Category(null, "Egg")));
                Category othersCat = categoryRepository.findByName("Others")
                        .orElseGet(() -> categoryRepository.save(new Category(null, "Others")));

                if (categoryRepository.findByName("Mutton").isEmpty()) {
                    categoryRepository.save(new Category(null, "Mutton"));
                }
                if (categoryRepository.findByName("Fish").isEmpty()) {
                    categoryRepository.save(new Category(null, "Fish"));
                }

                // Seed 21 default products uniquely distributed across 6 restaurants

                // r5: Chowmein Hub
                seedProduct(productRepository, "Veg Chowmein", 
                        "Stir-fried noodles with crisp fresh vegetables and light soy sauce.", 
                        120.00, 50.0, othersCat, 
                        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", r5);

                seedProduct(productRepository, "Egg Chowmein", 
                        "Classic stir-fried noodles tossed with scrambled farm eggs and fresh veggies.", 
                        140.00, 40.0, eggCat, 
                        "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&auto=format&fit=crop&q=80", r5);

                seedProduct(productRepository, "Chicken Chowmein", 
                        "Stir-fried noodles loaded with tender shredded chicken breasts and crisp vegetables.", 
                        170.00, 40.0, chickenCat, 
                        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&auto=format&fit=crop&q=80", r5);

                // r3: Abar Taste Kora
                seedProduct(productRepository, "Veg Fried Rice", 
                        "Fluffy aromatic basmati rice wok-tossed with finely chopped garden fresh vegetables.", 
                        130.00, 50.0, othersCat, 
                        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80", r3);

                seedProduct(productRepository, "Egg Fried Rice", 
                        "Wok-fried aromatic rice cooked with scrambled eggs, green onions, and spices.", 
                        150.00, 40.0, eggCat, 
                        "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80", r3);

                seedProduct(productRepository, "Chicken Fried Rice", 
                        "Savory fried rice tossed with juicy chicken bits, eggs, and seasoned vegetables.", 
                        180.00, 40.0, chickenCat, 
                        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80", r3);

                // r1: Lutumari Fast Food
                seedProduct(productRepository, "Chicken Roll", 
                        "Tender spiced chicken pieces rolled in a soft flaky flatbread with onions and tasty sauces.", 
                        110.00, 60.0, chickenCat, 
                        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=80", r1);

                seedProduct(productRepository, "Egg Roll", 
                        "Golden fried egg layered flatbread rolled with crisp onions, lime, and chat masala.", 
                        70.00, 60.0, eggCat, 
                        "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&auto=format&fit=crop&q=80", r1);

                seedProduct(productRepository, "Chicken Egg Roll", 
                        "Double delight roll containing a layer of egg and stuffed with juicy tandoori chicken chunks.", 
                        130.00, 50.0, chickenCat, 
                        "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=600&auto=format&fit=crop&q=80", r1);

                seedProduct(productRepository, "Burger", 
                        "Juicy premium chicken patty burger with cheese, fresh lettuce, tomatoes, and house sauce.", 
                        99.00, 50.0, othersCat, 
                        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", r1);

                seedProduct(productRepository, "Pizza", 
                        "10-inch classic pizza loaded with fresh herbs, mozzarella cheese, and rich tomato sauce.", 
                        249.00, 30.0, othersCat, 
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", r1);

                seedProduct(productRepository, "Sandwich", 
                        "Double-layered grilled club sandwich stuffed with fresh veggies, cheese, and creamy spread.", 
                        80.00, 50.0, othersCat, 
                        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80", r1);

                // r2: Nagaon Spicy Kitchen
                seedProduct(productRepository, "Chicken Biryani", 
                        "Aromatic basmati rice cooked with premium spices, saffron, and tender chicken leg piece.", 
                        220.00, 45.0, chickenCat, 
                        "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80", r2);

                seedProduct(productRepository, "Chicken Tandoori", 
                        "Classic clay-oven roasted chicken marinated in yogurt, tandoori spices, and lemon.", 
                        280.00, 30.0, chickenCat, 
                        "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80", r2);

                seedProduct(productRepository, "Chicken Roast", 
                        "Crispy and juicy pan-roasted chicken seasoned with garlic, black pepper, and butter.", 
                        260.00, 30.0, chickenCat, 
                        "https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?w=600&auto=format&fit=crop&q=80", r2);

                // r4: Biryani Express Nagaon
                seedProduct(productRepository, "Momos", 
                        "Steamed savory dumplings served with spicy red chutney and clear broth.", 
                        80.00, 60.0, othersCat, 
                        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80", r4);

                seedProduct(productRepository, "Chicken Momos", 
                        "Soft steamed dumplings stuffed with succulent minced chicken and mild spices.", 
                        120.00, 50.0, chickenCat, 
                        "https://images.unsplash.com/photo-1625220194771-7ebded0d90ae?w=600&auto=format&fit=crop&q=80", r4);

                seedProduct(productRepository, "Veg Momos", 
                        "Delicate steamed dumplings filled with finely chopped cabbage, carrots, and onions.", 
                        90.00, 50.0, othersCat, 
                        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", r4);

                // r6: Fish Corner
                seedProduct(productRepository, "Boiled Egg", 
                        "Two perfectly hard-boiled farm-fresh eggs sprinkled with black pepper and salt.", 
                        20.00, 100.0, eggCat, 
                        "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&auto=format&fit=crop&q=80", r6);

                seedProduct(productRepository, "Samosa", 
                        "Two golden-fried triangular pastries stuffed with spiced potatoes and green peas.", 
                        30.00, 100.0, othersCat, 
                        "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80", r6);

                seedProduct(productRepository, "Singara", 
                        "Traditional Bengali-style shortcrust samosa filled with spiced potato chunks and peanuts.", 
                        20.00, 100.0, othersCat, 
                        "https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=600&auto=format&fit=crop&q=80", r6);

                System.out.println("21 default products successfully seeded!");
            } else {
                System.out.println("Database already contains exactly 21 products. Skipping seeding.");
            }
        };
    }

    private void seedProduct(ProductRepository productRepository, 
                             String name, String desc, double price, double stock, 
                             Category category, String imageUrl, Restaurant restaurant) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(desc);
        product.setPrice(BigDecimal.valueOf(price));
        product.setStock(stock);
        product.setCategory(category);
        product.setRestaurant(restaurant);
        
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(imageUrl);
        
        product.getImages().add(image);
        productRepository.save(product);
    }
}
